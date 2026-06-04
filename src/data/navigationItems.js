import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHouse,
  faGear,
  faBook,
  faChartLine,
} from "@fortawesome/free-solid-svg-icons";

import { TbCardsFilled } from "react-icons/tb";

const navigationItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <FontAwesomeIcon icon={faHouse} />,
    path: "/",
  },
  {
    id: "decks",
    label: "Decks",
    icon: <TbCardsFilled />,
    path: "/decks",
  },
  {
    id: "study",
    label: "Study",
    icon: <FontAwesomeIcon icon={faBook} />,
    path: "/study",
  },
  {
    id: "activity",
    label: "Activity",
    icon: <FontAwesomeIcon icon={faChartLine} />,
    path: "/activity",
  },
  {
    id: "settings",
    label: "Settings",
    icon: <FontAwesomeIcon icon={faGear} />,
    path: "/settings",
  },
];

export default navigationItems;
