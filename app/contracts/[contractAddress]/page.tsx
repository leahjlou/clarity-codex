"use client";

import { useState, useEffect, use } from "react";
import { Box, Container, Text, Spinner, Code } from "@chakra-ui/react";

export default function ContractDetailPage({
  params,
}: {
  params: Promise<{ contractAddress: string }>;
}) {
  const resolvedParams = use(params);
  const contractAddress = resolvedParams.contractAddress;

  const [sourceCode, setSourceCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContractSource = async () => {
      if (!contractAddress) return;

      try {
        setLoading(true);
        // Split the contract address into components
        const [address, name] = decodeURIComponent(
          contractAddress as string
        ).split(".");

        const response = await fetch(
          `https://api.hiro.so/v2/contracts/source/${address}/${name}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch contract source");
        }

        const data = await response.json();
        setSourceCode(data.source);
      } catch (err: any) {
        console.error("Error fetching contract source:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchContractSource();
  }, [contractAddress]);

  if (!contractAddress) {
    return null;
  }

  return (
    <Container maxW="container.xl" py={8}>
      <Text fontSize="2xl" mb={6}>
        Contract: {decodeURIComponent(contractAddress as string)}
      </Text>

      {loading && (
        <Box textAlign="center" py={8}>
          <Spinner size="xl" />
        </Box>
      )}

      {error && (
        <Box p={4} bg="red.100" color="red.700" borderRadius="md">
          Error loading contract source: {error}
        </Box>
      )}

      {!loading && !error && (
        <Box bg="gray.50" p={6} borderRadius="md" overflowX="auto">
          <Code display="block" whiteSpace="pre" fontSize="sm">
            {sourceCode}
          </Code>
        </Box>
      )}
    </Container>
  );
}
