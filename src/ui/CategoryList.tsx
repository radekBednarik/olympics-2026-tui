import { Box, Text, useInput } from "ink";
import type React from "react";
import { useState } from "react";

interface CategoryListProps {
  categories: string[];
  highlightedCategories: Set<string>;
  isActive: boolean;
  onSelect: (category: string) => void;
}

export const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  highlightedCategories,
  isActive,
  onSelect,
}) => {
  const [cursor, setCursor] = useState(0);

  useInput(
    (_input, key) => {
      if (key.upArrow) {
        setCursor((prev) => Math.max(0, prev - 1));
      } else if (key.downArrow) {
        setCursor((prev) => Math.min(categories.length - 1, prev + 1));
      } else if (key.return) {
        const selected = categories[cursor];
        if (selected) {
          onSelect(selected);
        }
      }
    },
    { isActive }
  );

  if (categories.length === 0) {
    return <Text color="yellow">No categories available.</Text>;
  }

  return (
    <Box flexDirection="column">
      <Text color="green" bold>
        {highlightedCategories.size}/{categories.length} sports with results
      </Text>
      <Box marginTop={1} flexDirection="column">
        {categories.map((cat, i) => {
          const hasData = highlightedCategories.has(cat);
          return (
            <Box key={cat}>
              {i === cursor ? (
                <Text color="cyan" bold>
                  ▸ {hasData ? "● " : "  "}
                  {cat}
                </Text>
              ) : hasData ? (
                <Text>
                  {"  "}
                  <Text color="green">● </Text>
                  {cat}
                </Text>
              ) : (
                <Text color="gray">
                  {"    "}
                  {cat}
                </Text>
              )}
            </Box>
          );
        })}
      </Box>
      <Box marginTop={1}>
        <Text color="gray">
          ↑/↓ Navigate · Enter Select · <Text color="green">●</Text> has results
        </Text>
      </Box>
    </Box>
  );
};
