import type {
  RunInput,
  FunctionRunResult,
  CartLine,
  ProductVariant,
} from "../generated/api";

const NO_CHANGES: FunctionRunResult = {
  operations: [],
};

export function run(input: RunInput): FunctionRunResult {
  
  const operations = input.cart.lines.reduce((ops, line) => {
    if (line.gwp?.value === "1") { 
      // If the line item has a GWP attribute with a value of "1", add an operation to the array
      ops.push({
        update: {
          cartLineId: line.id,
          title: `${(line.merchandise as ProductVariant).product.title} - updated`,
          price: {
            adjustment: {
              fixedPricePerUnit: {
                amount: 0, // Set the price to 0
              },
            },
          },
        },
      });
    }
    return ops;
  }, [] as any[]);
  
  return {
    operations,
  };
};