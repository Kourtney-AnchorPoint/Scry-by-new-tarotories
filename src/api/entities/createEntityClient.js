import { client } from '@/lib/amplifyClient';

// Base44's `sort` param was a string like '-created_date' (leading '-' = desc).
// Amplify Data doesn't take a sort string — list() returns unordered results
// and sorting has to happen client-side. `created_date`/`updated_date` map to
// Amplify's auto-generated `createdAt`/`updatedAt` timestamps.
function sortField(base44Field) {
  if (base44Field === 'created_date' || base44Field === '-created_date') return 'createdAt';
  if (base44Field === 'updated_date' || base44Field === '-updated_date') return 'updatedAt';
  return base44Field?.replace(/^-/, '') || 'createdAt';
}

function applySort(items, sort) {
  if (!sort) return items;
  const desc = sort.startsWith('-');
  const field = sortField(sort);
  return [...items].sort((a, b) => {
    const av = a[field] ?? '';
    const bv = b[field] ?? '';
    if (av < bv) return desc ? 1 : -1;
    if (av > bv) return desc ? -1 : 1;
    return 0;
  });
}

// Base44's `.filter(query)` used exact-match key/value pairs. Amplify's list
// filter needs each field wrapped in { eq: value }.
function toAmplifyFilter(query) {
  if (!query || Object.keys(query).length === 0) return undefined;
  const filter = {};
  for (const [key, value] of Object.entries(query)) {
    filter[key] = { eq: value };
  }
  return filter;
}

// Pages/components across the app read `.created_date`/`.updated_date`
// (Base44's field names) directly off returned records. Rather than hunt
// down every call site, alias Amplify's auto-generated `createdAt`/
// `updatedAt` onto those same names so records look identical either way.
function withDateAliases(record) {
  if (!record) return record;
  return {
    ...record,
    created_date: record.createdAt,
    updated_date: record.updatedAt,
  };
}

// Shared CRUD shape for every Amplify Data model (AppSync + DynamoDB) —
// preserves the exact call signature every page/component already used
// against base44.entities.X (list, filter, get, create, update, delete).
export function createEntityClient(entityName) {
  const model = () => client.models[entityName];

  async function list(sort, limit) {
    const { data, errors } = await model().list(limit ? { limit } : undefined);
    if (errors?.length) throw new Error(errors[0].message);
    return applySort(data.map(withDateAliases), sort);
  }

  async function filter(query, sort, limit) {
    const { data, errors } = await model().list({ filter: toAmplifyFilter(query), limit });
    if (errors?.length) throw new Error(errors[0].message);
    return applySort(data.map(withDateAliases), sort);
  }

  async function get(id) {
    const { data, errors } = await model().get({ id });
    if (errors?.length) throw new Error(errors[0].message);
    return withDateAliases(data);
  }

  async function create(data) {
    const { data: created, errors } = await model().create(data);
    if (errors?.length) throw new Error(errors[0].message);
    return withDateAliases(created);
  }

  async function update(id, data) {
    const { data: updated, errors } = await model().update({ id, ...data });
    if (errors?.length) throw new Error(errors[0].message);
    return withDateAliases(updated);
  }

  async function del(id) {
    const { errors } = await model().delete({ id });
    if (errors?.length) throw new Error(errors[0].message);
  }

  return { list, filter, get, create, update, delete: del };
}
