import {
  faBookOpen,
  faCircleQuestion,
} from "@fortawesome/free-solid-svg-icons";

export const STUDY_TOUR_STEPS = [
  {
    icon: faBookOpen,
    title: "How to study",
    body: `Welcome to your study session!

You'll see one card at a time. Read the prompt, recall the answer, then flip or reveal it to check yourself.

After each card, rate how well you remembered it. The better your rating, the longer before you'll see it again — so you spend time on what actually needs practice.`,
  },
  {
    icon: null,
    title: "Standard cards",
    body: `Standard cards display the word you want to learn on the front and a translation or answer on the back.

After flipping, you'll rate how well you remembered it. Your self-assessment will allow the algorithm to calculate the optimal review schedule.`,
  },
  {
    icon: null,
    title: "Character cards",
    body: `Designed specifically for Chinese, character cards guide you through a specialized three-step learning process:

1. Animation: Visualize the character being drawn.
2. Outline: Trace it yourself following the proper stroke order.
3. Draw: Write it entirely from memory.

If you struggle, a hint will appear. Your rating is automatically calculated based on your precision!`,
  },
  {
    icon: faCircleQuestion,
    title: "Help",
    body: `Click on the ? icon to see this tutorial again.`,
  },
];
