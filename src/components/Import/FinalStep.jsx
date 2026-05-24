import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload } from "@fortawesome/free-solid-svg-icons";
import { Bar } from "../General/ui/Bar";

const FinalStep = ({ activeTheme, logic }) => {
  return (
    <>
      {logic.isProcessing ? (
        <div className="text-center space-y-4 py-8">
          <div
            className={`w-16 h-16 mx-auto text-red-500 rounded-full flex items-center justify-center`}
          >
            <FontAwesomeIcon
              icon={faUpload}
              className={`w-8 h-8 ${activeTheme.text.primary} animate-pulse`}
            />
          </div>
          <h3 className={`text-lg font-semibold ${activeTheme.text.primary}`}>
            Processing Import...
          </h3>
          <p className={`${activeTheme.text.muted}`}>
            Creating your deck and processing {logic.fileContent.length} cards
          </p>
          <Bar
            current={logic.processingProgress.current}
            total={logic.processingProgress.total}
            activeTheme={activeTheme}
            isLabelOn={true}
          />
        </div>
      ) : (
        <div className="text-center space-y-4 py-8">
          <h3 className={`text-lg font-semibold ${activeTheme.text.primary}`}>
            Import Complete!{" "}
          </h3>
        </div>
      )}
    </>
  );
};

export default FinalStep;
