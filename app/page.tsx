"use client";

import { useState, useEffect } from "react";
import { LinkBox, LinkOverlay, Flex, Box } from "@chakra-ui/react";
import Link from "next/link";
import { Contract } from "./types/contract";
import { FileCode } from "@phosphor-icons/react";
import TagTypeahead from "./components/TagTypeahead";
import Tag from "./components/Tag";

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[] | null>(null);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [tagsFilterValue, setTagsFilterValue] = useState<string[]>([]);

  useEffect(() => {
    const loadContracts = async () => {
      try {
        const response = await fetch("/api/contracts");
        const data = await response.json();
        setContracts(data);
      } catch (error) {
        console.error("Error loading contracts:", error);
      }
    };

    loadContracts();
  }, []);

  useEffect(() => {
    if (contracts && contracts.length > 0) {
      const uniqueTags = Array.from(
        new Set(contracts.flatMap((contract) => contract.analysis.tags || []))
      );
      setAllTags(uniqueTags);
    }
  }, [contracts]);

  return (
    <Flex direction="column" gap="8">
      <Flex direction="column" gap="4">
        <TagTypeahead
          allTags={allTags}
          value={tagsFilterValue}
          onChange={setTagsFilterValue}
        />
      </Flex>
      <Flex direction="column" gap="4">
        <Box
          textTransform="uppercase"
          fontSize="xs"
          fontWeight="bold"
          letterSpacing="wide"
        >
          Top Contracts On Stacks Mainnet
        </Box>
        {contracts && contracts.length === 0 ? (
          <Box>No contracts found</Box>
        ) : null}
        {contracts
          ?.filter((contract) => {
            if (!tagsFilterValue || tagsFilterValue?.length === 0) return true;
            return tagsFilterValue.some((tag) =>
              contract.analysis.tags.includes(tag)
            );
          })
          ?.map((contract) => (
            <LinkBox
              key={contract.rank}
              p={4}
              borderWidth="1px"
              borderColor="gray.300"
              borderRadius="md"
              _hover={{ bg: "gray.100", borderColor: "gray.900" }}
            >
              <LinkOverlay
                as={Link}
                href={`/contracts/${encodeURIComponent(contract.contract)}`}
                display="flex"
                flexDirection="column"
                gap="4"
              >
                <Flex gap="2" align="center">
                  <FileCode size="24px" />
                  <Box fontSize="xl" fontFamily="mono">
                    {contract.contract.split(".")[1]}
                  </Box>
                </Flex>
                <Box fontSize="sm">{contract.analysis.summary}</Box>
                <Flex gap="4" align="center">
                  <Box
                    textTransform="uppercase"
                    fontSize="xs"
                    fontWeight="bold"
                    letterSpacing="wide"
                  >
                    Keywords
                  </Box>
                  <Box flexGrow="2">
                    {contract.analysis.tags.map((tag) => (
                      <Tag key={tag} tag={tag} />
                    ))}
                  </Box>
                </Flex>
                <Flex gap="4" align="center">
                  <Box
                    textTransform="uppercase"
                    fontSize="xs"
                    fontWeight="bold"
                    letterSpacing="wide"
                  >
                    Popularity
                  </Box>
                  <Box flexGrow="2" fontSize="xs">
                    Ranked <strong>#{contract.rank}</strong>, called{" "}
                    {contract.calls.toLocaleString()} times this month
                  </Box>
                </Flex>
              </LinkOverlay>
            </LinkBox>
          ))}
      </Flex>
    </Flex>
  );
}
