import { Button } from "@/components/ui/button";
import { Box, Code } from "@chakra-ui/react";
import { MagnifyingGlassPlus } from "@phosphor-icons/react";
import React from "react";

const FormattedContractExplanation = ({
  content,
  handleHighlightCode,
}: {
  content: string;
  handleHighlightCode: (start: number, end: number) => void;
}) => {
  // Function to process the text and split it into segments
  const processText = (inputText: string) => {
    const segments = [];
    let currentIndex = 0;

    const codePattern = /'[a-zA-Z][a-zA-Z0-9-*]*[!?]?'/g;
    const linePattern = /<L\d+(?:-\d+)?>/g;

    // first pass - handle line refs
    let lineMatch;
    while ((lineMatch = linePattern.exec(inputText)) !== null) {
      if (lineMatch.index > currentIndex) {
        // stash the text between matches for code processing later
        segments.push({
          type: "text",
          content: inputText.slice(currentIndex, lineMatch.index),
        });
      }

      const [start, end] = lineMatch[0]
        .slice(2, -1)
        .split("-")
        .map((n) => parseInt(n));

      segments.push({
        type: "lineRef",
        content: end ? `Lines ${start}-${end}` : `Line ${start}`,
      });

      currentIndex = lineMatch.index + lineMatch[0].length;
    }

    // process remaining text for code tokens
    if (currentIndex < inputText.length) {
      const remainingText = inputText.slice(currentIndex);
      segments.push({
        type: "text",
        content: remainingText,
      });
    }

    // second pass - process all text segments for code tokens
    return segments.flatMap((segment) => {
      if (segment.type !== "text") return segment;

      const codeSegments = [];
      let textIndex = 0;
      let codeMatch;

      while ((codeMatch = codePattern.exec(segment.content)) !== null) {
        if (codeMatch.index > textIndex) {
          codeSegments.push({
            type: "text",
            content: segment.content.slice(textIndex, codeMatch.index),
          });
        }

        codeSegments.push({
          type: "code",
          content: codeMatch[0].slice(1, -1),
        });

        textIndex = codeMatch.index + codeMatch[0].length;
      }

      if (textIndex < segment.content.length) {
        codeSegments.push({
          type: "text",
          content: segment.content.slice(textIndex),
        });
      }

      return codeSegments;
    });
  };

  const segments = processText(content);

  return (
    <Box whiteSpace="pre-line">
      {segments.map((segment, index) => {
        switch (segment.type) {
          case "code":
            return (
              <Code bg="gray.200" fontWeight="bold" key={index}>
                {segment.content}
              </Code>
            );
          case "lineRef":
            return (
              <Button
                bg="pink.400"
                px="1.5"
                h="18px"
                mt="-0.5"
                borderRadius="xl"
                color="white"
                size="xs"
                fontSize="xs"
                key={index}
                onClick={() => {
                  const match = segment.content.match(
                    /Lines? (\d+)(?:-(\d+))?/
                  );
                  if (!match) return;

                  const start = parseInt(match[1]);
                  const end = match[2] ? parseInt(match[2]) : start;
                  handleHighlightCode(start, end);
                }}
                _hover={{ bg: "pink.500" }}
              >
                <MagnifyingGlassPlus />
                {segment.content}
              </Button>
            );
          default:
            return <span key={index}>{segment.content}</span>;
        }
      })}
    </Box>
  );
};

export default FormattedContractExplanation;
