import React from "react";
import FlipCard from "../../Study/components/Card/FlipCard";

export function TutorialFlipCardDemo({ activeTheme }) {
  const mockCard = {
    id: "demo-card",
    front: "Bonjour",
    back: "Hello",
  };

  return (
    <div
      className={`w-full max-w-[300px] flex flex-col items-center justify-center`}
    >
      <div className="w-full h-44 sm:h-48 relative">
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
