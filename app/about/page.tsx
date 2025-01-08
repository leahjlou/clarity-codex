"use client";

import { Box, Flex, Link } from "@chakra-ui/react";

export default function AboutPage() {
  return (
    <Flex maxW="600px" mx="auto" pt="8" direction="column" gap="4">
      <Box>
        <strong>Clarity Codex</strong> is an index of the most popular smart
        contracts on the{" "}
        <Link
          color="blue.500"
          textDecor="underline"
          href="https://explorer.hiro.so"
          target="_blank"
        >
          Stacks Blockchain
        </Link>
        , tagged with keywords, along with descriptions and line-by-line
        walkthroughs.
      </Box>
      <Box>
        These popularity rankings are based on a recent sample of contract call
        transactions. The more calls to the contract, the more popular it is
        considered to be.
      </Box>
      <Box>
        Smart Contracts on Stacks are written in a language called{" "}
        <Link
          href="https://clarity-lang.org/"
          target="_blank"
          color="blue.500"
          textDecor="underline"
        >
          Clarity
        </Link>
        . Clarity is a unique language which is precise, predictable, & secure.
        It&apos;s never compiled&mdash;rather, the source code written by the
        developer is directly broadcasted & executed on the blockchain.
      </Box>
    </Flex>
  );
}
