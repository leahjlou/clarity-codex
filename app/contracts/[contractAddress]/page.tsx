"use client";

import { useState, useEffect, use, useRef } from "react";
import { Text, Flex, Box, Link, Button } from "@chakra-ui/react";
import Editor, { Monaco, useMonaco } from "@monaco-editor/react";
import { autocomplete, hover } from "@/app/components/editor/autocomplete";
import { defineTheme } from "@/app/components/editor/define-theme";
import { liftOff } from "@/app/components/editor/init";
import { claritySyntax } from "@/app/components/editor/clarity-syntax";
import { configLanguage } from "@/app/components/editor/language";
import { Contract } from "@/app/types/contract";
import { FileCode, SortAscending } from "@phosphor-icons/react";
import CopyButton from "@/app/components/CopyButton";
import Tag from "@/app/components/Tag";
import FormattedContractExplanation from "@/app/components/FormattedContractExplanation";
import { MAX_APP_WIDTH } from "@/app/constants";

export default function ContractDetailPage({
  params,
}: {
  params: Promise<{ contractAddress: string }>;
}) {
  const resolvedParams = use(params);
  const contractAddress = decodeURIComponent(resolvedParams.contractAddress);

  const [contract, setContract] = useState<Contract | null>(null);

  useEffect(() => {
    const loadContract = async () => {
      try {
        const response = await fetch("/api/contracts");
        const data = await response.json();
        setContract(data.find((c: Contract) => c.contract === contractAddress));
      } catch (error) {
        console.error("Error loading contracts:", error);
      }
    };

    loadContract();
  }, [contractAddress]);

  const monaco = useMonaco();
  const monacoEditor = useRef<any>(null);
  const [activeDecorations, setActiveDecorations] = useState<string[]>([]);

  const handleEditorWillMount = async (monacoInstance: Monaco) => {
    configLanguage(monacoInstance);
    hover(monacoInstance);
    autocomplete(monacoInstance);
    defineTheme(monacoInstance);
    await liftOff(monacoInstance, claritySyntax);
  };

  const isLargeScreen = window.innerWidth > 800;
  const availableHeight = window.innerHeight - 155 - 32;
  const availableWidth = Math.min(MAX_APP_WIDTH, window.innerWidth);
  const editorHeight = availableHeight > 600 ? availableHeight : 600;
  const editorWidth = isLargeScreen
    ? availableWidth * 0.6
    : availableWidth - 32;

  const highlightCode = (startLine: number, endLine: number) => {
    if (monaco) {
      const newDecorations = monacoEditor.current.deltaDecorations(
        activeDecorations,
        [
          {
            range: new monaco.Range(startLine, 1, endLine, 1),
            options: {
              isWholeLine: true,
              className: "highlighted-line",
            },
          },
        ]
      );

      setActiveDecorations(newDecorations);

      monacoEditor.current.revealLineInCenter(startLine);
    }
  };

  const clearHighlight = () => {
    if (!monacoEditor.current) return;
    monacoEditor.current.deltaDecorations(activeDecorations, []);
    setActiveDecorations([]);
  };

  const infoPane = contract ? (
    <Flex
      direction="column"
      maxHeight={`${editorHeight}px`}
      overflowY="auto"
      gap="6"
      p="3"
      pr="6"
      borderRadius="md"
      border="1px solid"
      borderColor="gray.300"
    >
      {/* Contract address */}
      <Flex direction="column">
        <Box
          textTransform="uppercase"
          fontSize="xs"
          fontWeight="bold"
          letterSpacing="wide"
        >
          Contract Address
        </Box>
        <Flex gap="1" fontSize="sm" align="center">
          <Link
            target="_blank"
            href={`https://explorer.hiro.so/txid/${contract.contract}?chain=mainnet`}
            color="blue.500"
            textDecor="underline"
            textUnderlineOffset="5px"
            wordBreak="break-word"
          >
            {contract?.contract}
          </Link>
          <CopyButton content={contract?.contract} />
        </Flex>
      </Flex>

      {/* Summary */}
      <Flex direction="column" gap="1">
        <Box
          textTransform="uppercase"
          fontSize="xs"
          fontWeight="bold"
          letterSpacing="wide"
        >
          Summary
        </Box>
        <Flex fontSize="sm" align="center">
          {contract?.analysis.summary}
        </Flex>
      </Flex>

      {/* Keywords */}
      <Flex direction="column" gap="1">
        <Box
          textTransform="uppercase"
          fontSize="xs"
          fontWeight="bold"
          letterSpacing="wide"
        >
          Keywords
        </Box>
        <Box>
          {contract.analysis.tags.map((tag) => (
            <Tag tag={tag} key={tag} />
          ))}
        </Box>
      </Flex>

      {/* Full explanation */}
      <Flex direction="column" gap="1">
        <Box
          textTransform="uppercase"
          fontSize="xs"
          fontWeight="bold"
          letterSpacing="wide"
        >
          Details
        </Box>
        <Flex whiteSpace="pre-line" fontSize="sm">
          <FormattedContractExplanation
            content={contract?.analysis.explanation}
            handleHighlightCode={highlightCode}
          />
        </Flex>
      </Flex>
    </Flex>
  ) : null;

  return (
    <Flex direction="column" gap="1">
      <Flex align="center" gap="2">
        <Link
          href="/"
          color="blue.500"
          textDecor="underline"
          textUnderlineOffset="5px"
        >
          <Flex gap="1" align="center">
            <SortAscending size="18px" />
            <Box
              textTransform="uppercase"
              fontSize="xs"
              fontWeight="bold"
              letterSpacing="wide"
            >
              Top Contracts List
            </Box>
          </Flex>
        </Link>
        /
        <Flex gap="1" align="center">
          <FileCode size="18px" />
          <Box
            textTransform="uppercase"
            fontSize="xs"
            fontWeight="bold"
            letterSpacing="wide"
          >
            Contract Details
          </Box>
        </Flex>
      </Flex>
      <Text fontSize="3xl" mt="-1" fontWeight="bold" fontFamily="mono" mb="1">
        {contractAddress.split(".")[1]}
      </Text>

      <Flex gap="3" direction={isLargeScreen ? "row" : "column"}>
        {isLargeScreen ? null : infoPane}
        <Box>
          {contract && (
            <Editor
              height={editorHeight}
              width={editorWidth}
              defaultLanguage="clarity"
              value={contract.source}
              beforeMount={handleEditorWillMount}
              onMount={(editor) => {
                monacoEditor.current = editor;
                editor.revealPosition({ lineNumber: 1, column: 1 });
                editor.updateOptions({
                  wordSeparators: "`~!@#$%^&*()=+[{]}\\|;:'\",.<>/?",
                });
              }}
              theme="vs-dark"
              keepCurrentModel
              options={{
                readOnly: true,
                fontLigatures: true,
                minimap: {
                  enabled: false,
                },
                folding: true,
                automaticLayout: true,
                padding: {
                  top: 16,
                },
              }}
            />
          )}
          {activeDecorations && activeDecorations.length > 0 ? (
            <Button
              bg="pink.600"
              _hover={{ bg: "pink.700" }}
              height="20px"
              color="white"
              borderRadius="xl"
              px="2"
              position="absolute"
              fontSize="xs"
              top={isLargeScreen ? "178px" : 278 + editorHeight}
              left={isLargeScreen ? editorWidth - 83 : "calc(100% - 120px)"}
              zIndex="5"
              onClick={() => clearHighlight()}
            >
              Clear highlight
            </Button>
          ) : null}
        </Box>
        {isLargeScreen ? infoPane : null}
      </Flex>
    </Flex>
  );
}
