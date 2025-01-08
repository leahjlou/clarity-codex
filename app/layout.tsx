import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Provider } from "@/components/ui/provider";

import { Container, Text, Flex, Heading } from "@chakra-ui/react";
import Link from "next/link";
import ExternalLinkIcon from "./components/ExternalLinkIcon";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Clarity Codex",
  description:
    "Browse & learn from real-world smart contracts on the Stacks blockchain.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Provider forcedTheme="light">
          <Container maxW="container.lg" py={4} px="4">
            <Flex
              direction={{ base: "column", md: "row" }}
              justify="space-between"
              align="start"
              mb={6}
              gap={{ base: 4, md: 0 }}
            >
              <Flex direction="column" gap="1">
                <Link href="/">
                  <Heading
                    fontSize="2xl"
                    fontFamily="mono"
                    letterSpacing="widest"
                    fontWeight="bold"
                  >
                    CLARITY CODEX
                  </Heading>
                </Link>
                <Text color="gray.500" fontSize="sm">
                  Browse & learn about real-world Stacks smart contracts.
                </Text>
              </Flex>

              <Flex
                gap={{ base: 4, md: 6 }}
                direction={{ base: "column", md: "row" }}
                align="start"
              >
                <Link href="/about">
                  <Flex
                    gap="1"
                    align="center"
                    borderBottom="2px solid"
                    borderColor="gray.200"
                  >
                    What&apos;s this?
                  </Flex>
                </Link>

                <Link href="https://hiro.so" target="_blank">
                  <Flex
                    gap="1"
                    align="center"
                    borderBottom="2px solid"
                    borderColor="gray.200"
                  >
                    hiro.so
                    <ExternalLinkIcon />
                  </Flex>
                </Link>
              </Flex>
            </Flex>
            {children}
          </Container>
        </Provider>
      </body>
    </html>
  );
}
