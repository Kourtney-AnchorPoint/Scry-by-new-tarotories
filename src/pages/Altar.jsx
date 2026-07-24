import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Flame } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AltarCardItem from '@/components/altar/AltarCardItem';
import UploadCardModal from '@/components/altar/UploadCardModal';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import BotanicalDivider from '@/components/shared/BotanicalDivider';

export default function Altar() {
  const [showUpload, setShowUpload] = useState(false);
  const queryClient = useQueryClient();

  const { data: cards = [], isLoading } = useQuery({
    queryKey: ['altar_cards'],
    queryFn: () => base44.entities.AltarCard.list('-created_date', 50),
  });

  const createCard = useMutation({
    mutationFn: (cardData) => base44.entities.AltarCard.create(cardData),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['altar_cards'] }),
  });

  const deleteCard = useMutation({
    mutationFn: (id) => base44.entities.AltarCard.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['altar_cards'] });
      const previous = queryClient.getQueryData(['altar_cards']);
      queryClient.setQueryData(['altar_cards'], (old) => old?.filter(c => c.id !== id) ?? []);
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) queryClient.setQueryData(['altar_cards'], context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['altar_cards'] }),
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/80 border border-border/50 text-xs text-muted-foreground mb-4">
          <Flame className="w-3.5 h-3.5" />
          Sacred Space
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold mb-2">
          <span className="shimmer-text">Your Digital Altar</span>
        </h1>
        <p className="text-muted-foreground max-w-md mx-auto text-sm">
          Upload photos of your own tarot cards to create a personal sacred collection.
        </p>
      </motion.div>

      <BotanicalDivider />

      {isLoading && <LoadingSpinner message="Gathering your cards..." />}

      {!isLoading && cards.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <div className="w-20 h-20 rounded-full bg-secondary/40 flex items-center justify-center mx-auto mb-4 border border-border/30">
            <Plus className="w-8 h-8 text-muted-foreground/50" />
          </div>
          <p className="text-muted-foreground text-sm mb-1">Your altar is empty</p>
          <p className="text-muted-foreground/50 text-xs mb-6">Add your first card photo to begin your collection</p>
          <button
            onClick={() => setShowUpload(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet to-teal text-white text-sm font-medium hover:opacity-90 transition-opacity select-none min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            Add Your First Card
          </button>
        </motion.div>
      )}

      {!isLoading && cards.length > 0 && (
        <>
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setShowUpload(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary/50 border border-border/50 text-sm font-medium hover:bg-secondary/80 transition-colors select-none min-h-[44px]"
            >
              <Plus className="w-4 h-4 text-primary" />
              Add Card
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            <AnimatePresence>
              {cards.map(card => (
                <AltarCardItem
                  key={card.id}
                  card={card}
                  onDelete={deleteCard.mutate}
                />
              ))}
            </AnimatePresence>
          </div>
        </>
      )}

      <AnimatePresence>
        {showUpload && (
          <UploadCardModal
            onClose={() => setShowUpload(false)}
            onSave={createCard.mutateAsync}
          />
        )}
      </AnimatePresence>
    </div>
  );
}