export const calculateScore = ({
  R,
  N,
  C,
  w1 = 0.2,
  w2 = 0.6,
  w3 = 0.2,
  lambda = 10000,
}: {
  R: number;
  N: number;
  C: number;
  w1?: number;
  w2?: number;
  w3?: number;
  lambda?: number;
}) => {
  const ratingComponent = (R - 1) / 4;
  const reviewComponent = 1 - Math.exp(-N / lambda);
  const categoryComponent = C;

  const score =
    10000 *
    (w1 * ratingComponent + w2 * reviewComponent + w3 * categoryComponent);

  return score;
};
