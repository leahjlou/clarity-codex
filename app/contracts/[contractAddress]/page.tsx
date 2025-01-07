"use client";

import { useState, useEffect, use, useRef } from "react";
import { Text, Flex, Box, Link } from "@chakra-ui/react";
import Editor, { Monaco, useMonaco } from "@monaco-editor/react";
import { autocomplete, hover } from "@/app/components/editor/autocomplete";
import { defineTheme } from "@/app/components/editor/define-theme";
import { liftOff } from "@/app/components/editor/init";
import { claritySyntax } from "@/app/components/editor/clarity-syntax";
import { configLanguage } from "@/app/components/editor/language";
import { Contract } from "@/app/types/contract";
import { ArrowLeft, FileCode } from "@phosphor-icons/react";
import CopyButton from "@/app/components/CopyButton";
import Tag from "@/app/components/Tag";

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

  const handleEditorWillMount = async (monacoInstance: Monaco) => {
    configLanguage(monacoInstance);
    hover(monacoInstance);
    autocomplete(monacoInstance);
    defineTheme(monacoInstance);
    await liftOff(monacoInstance, claritySyntax);
  };

  const availableHeight = window.innerHeight - 189 - 32;
  const editorHeight = availableHeight > 600 ? availableHeight : 600;
  const editorWidth =
    window.innerWidth > 800
      ? (window.innerWidth - 48) * 0.6
      : window.innerWidth - 32;

  return (
    <Flex direction="column">
      <Link href="/" mb="6">
        <Flex gap="1" align="center">
          <ArrowLeft size="14px" />
          <Flex
            gap="1"
            align="center"
            borderBottom="2px solid"
            borderColor="gray.200"
            fontSize="sm"
          >
            Back to list
          </Flex>
        </Flex>
      </Link>
      <Flex gap="2" align="center" color="gray.500">
        <FileCode size="18px" />
        <Box
          textTransform="uppercase"
          fontSize="xs"
          fontWeight="bold"
          letterSpacing="wide"
        >
          Stacks Smart Contract
        </Box>
      </Flex>
      <Text fontSize="3xl" mt="-1" fontWeight="bold" fontFamily="mono" mb="1">
        {contractAddress.split(".")[1]}
      </Text>

      <Flex gap="3">
        {contract && (
          <Editor
            height={editorHeight}
            width={editorWidth}
            defaultLanguage="clarity"
            value={contract.source}
            beforeMount={handleEditorWillMount}
            onMount={(editor) => {
              monacoEditor.current = editor;
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
        {contract ? (
          <Flex
            direction="column"
            width="40%"
            maxHeight={`${editorHeight}px`}
            overflowY="auto"
            pr="3"
            gap="6"
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
              <Flex>
                {contract.analysis.tags.map((tag) => (
                  <Tag tag={tag} key={tag} />
                ))}
              </Flex>
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
                {contract?.analysis.explanation}
              </Flex>
            </Flex>
          </Flex>
        ) : null}
      </Flex>
    </Flex>
  );
}
