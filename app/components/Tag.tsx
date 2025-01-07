import { Badge } from "@chakra-ui/react";

const TAG_COLORS: { [key: string]: string } = {
  NFT: "pink.500",
  DeFi: "green.500",
  Bitcoin: "orange.500",
  DEX: "yellow.500",
  AMM: "blue.500",
  ["fungible-token"]: "purple.500",
  DAO: "red.500",
};

const Tag = ({ tag }: { tag: string }) => {
  return (
    <Badge key={tag} mr="2" bg={TAG_COLORS[tag] || "gray.500"} color="white">
      {tag}
    </Badge>
  );
};

export default Tag;
