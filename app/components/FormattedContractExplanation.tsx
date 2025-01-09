import { Button } from "@/components/ui/button";
import { Box, Code, Text } from "@chakra-ui/react";
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
    const boldPattern = /\*\*([^*]+)\*\*/g;

    // match both the full <L...> block and capture individual L## or L##-## references
    const lineBlockPattern = /<((?:L\d+(?:-\d+)?(?:,\s*L\d+(?:-\d+)?)*))>/g;
    const singleLinePattern = /L(\d+)(?:-(\d+))?/g;

    // first pass - handle line refs
    let lineMatch;
    while ((lineMatch = lineBlockPattern.exec(inputText)) !== null) {
      if (lineMatch.index > currentIndex) {
        segments.push({
          type: "text",
          content: inputText.slice(currentIndex, lineMatch.index),
        });
      }

      // process each line reference within the block
      const lineBlock = lineMatch[1]; // the content between < >
      let singleLineMatch;
      while ((singleLineMatch = singleLinePattern.exec(lineBlock)) !== null) {
        const start = parseInt(singleLineMatch[1]);
        const end = singleLineMatch[2] ? parseInt(singleLineMatch[2]) : null;
        segments.push({
          type: "lineRef",
          content: end ? `Lines ${start}-${end}` : `Line ${start}`,
        });
      }

      currentIndex = lineMatch.index + lineMatch[0].length;
    }

    // process remaining text for code tokens
    if (currentIndex < inputText.length) {
      segments.push({
        type: "text",
        content: inputText.slice(currentIndex),
      });
    }

    // second pass - process all text segments for bold text
    const processBoldText = (segment: any) => {
      if (segment.type !== "text") return segment;
      const boldSegments = [];
      let textIndex = 0;
      let boldMatch;
      while ((boldMatch = boldPattern.exec(segment.content)) !== null) {
        if (boldMatch.index > textIndex) {
          boldSegments.push({
            type: "text",
            content: segment.content.slice(textIndex, boldMatch.index),
          });
        }
        boldSegments.push({
          type: "bold",
          content: boldMatch[1],
        });
        textIndex = boldMatch.index + boldMatch[0].length;
      }
      if (textIndex < segment.content.length) {
        boldSegments.push({
          type: "text",
          content: segment.content.slice(textIndex),
        });
      }
      return boldSegments;
    };

    const afterBold = segments.flatMap(processBoldText);

    // third pass - process all text segments for code tokens
    return afterBold.flatMap((segment) => {
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
                mx="0.5"
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
          case "bold":
            return (
              <Text display="inline" fontWeight="bold">
                {segment.content}
              </Text>
            );
          default:
            return <span key={index}>{segment.content}</span>;
        }
      })}
    </Box>
  );
};

export default FormattedContractExplanation;
