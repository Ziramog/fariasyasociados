import { useScrollAnimation } from '@/hooks/useScrollAnimation';

export default function ScrollAnimationProvider({ children }) {
  useScrollAnimation();
  return <>{children}</>;
}