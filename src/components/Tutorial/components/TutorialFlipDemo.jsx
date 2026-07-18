import FlipCard from "../../Study/components/Card/FlipCard";

export function TutorialFlipCardDemo({ activeTheme }) {
  const mockCard = {
    id: "demo-card",
    front: "Bonjour",
    back: "Hello",
  };

  return (
    <div className="w-full h-64 flex flex-col items-center justify-center overflow-hidden">
      <div className="w-full h-40 relative">
        <FlipCard
          card={mockCard}
          activeTheme={activeTheme}
          displayState="quiz"
          allowRating={true}
          onRate={() => {}}
          variant="demo"
        />
      </div>
    </div>
  );
}
