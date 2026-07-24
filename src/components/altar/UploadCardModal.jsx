import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

export default function UploadCardModal({ onClose, onSave }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [cardName, setCardName] = useState('');
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(selected);
  };

  const handleSave = async () => {
    if (!file || !cardName.trim()) return;
    setUploading(true);
    setError(null);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await onSave({
        card_name: cardName.trim(),
        card_image_url: file_url,
        notes: notes.trim() || undefined,
      });
      onClose();
    } catch (err) {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-background/80 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-card rounded-t-3xl sm:rounded-3xl p-6 w-full max-w-md space-y-5 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold">Add to Your Altar</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-secondary/50 select-none">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div
          onClick={() => !uploading && fileInputRef.current?.click()}
          className="border-2 border-dashed border-border/50 rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-secondary/20 transition-all select-none"
        >
          {preview ? (
            <img src={preview} alt="Preview" className="max-h-48 rounded-lg mx-auto" />
          ) : (
            <div className="flex flex-col items-center gap-2 py-4">
              <ImageIcon className="w-8 h-8 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">Tap to upload your card photo</p>
              <p className="text-xs text-muted-foreground/50">JPG, PNG up to 10MB</p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground uppercase tracking-wider">Card Name</label>
          <input
            type="text"
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
            placeholder="e.g. The Star, grandmother's deck..."
            className="w-full bg-secondary/50 border border-border/50 rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground uppercase tracking-wider">Notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="What does this card mean to you?"
            rows={3}
            className="w-full bg-secondary/50 border border-border/50 rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors resize-none"
          />
        </div>

        {error && <p className="text-xs text-destructive text-center">{error}</p>}

        <Button
          onClick={handleSave}
          disabled={!file || !cardName.trim() || uploading}
          className="w-full bg-gradient-to-r from-violet to-teal text-white hover:opacity-90 disabled:opacity-40 py-3 select-none min-h-[44px]"
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              Add to Altar
            </>
          )}
        </Button>
      </motion.div>
    </motion.div>
  );
}