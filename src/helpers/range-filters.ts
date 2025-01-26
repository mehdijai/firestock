import { and, QueryFilterConstraint, where } from "firebase/firestore";

export function filterRange(
  name: string,
  from: number | undefined,
  to: number | undefined
) {
  const filters: QueryFilterConstraint[] = [];

  if (from && to) {
    filters.push(and(where(name, ">=", from), where(name, "<=", to)));
  } else if (from) {
    filters.push(where(name, ">=", from));
  } else if (to) {
    filters.push(where(name, "<=", to));
  }

  return filters;
}
