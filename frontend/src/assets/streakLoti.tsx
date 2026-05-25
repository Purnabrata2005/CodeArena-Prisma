import { DotLottiePlayer } from "@dotlottie/react-player";

interface StreakLotiProps {
  className?: string;
}

const StreakLoti = ({ className }: StreakLotiProps) => {
  return (
    <div className={className}>
      <DotLottiePlayer src="/fire.lottie" autoplay loop />
    </div>
  );
};

export default StreakLoti;
