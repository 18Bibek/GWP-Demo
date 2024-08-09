import {
  reactExtension,
  Banner,
  BlockStack,
  Checkbox,
  Text,
  useApi,
  useApplyAttributeChange,
  useInstructions,
  useTranslate,
  useDiscountCodes,
  useApplyCartLinesChange,
  useCartLines,
  useSettings,
} from "@shopify/ui-extensions-react/checkout";
import { useEffect,useState } from "react";

// 1. Choose an extension target
export default reactExtension("purchase.checkout.block.render", () => (
  <Extension />
));

function Extension() {
  const translate = useTranslate();
  const { extension } = useApi();
  const instructions = useInstructions();
  const applyAttributeChange = useApplyAttributeChange();

  const discountCode = useDiscountCodes();
  const [isDiscountApplied, setIsDiscountApplied] = useState(false);
  const applyCartLinesChange = useApplyCartLinesChange();

  const useSetting = useSettings();
  console.log("usesettings", useSetting);

  const variantID = useSetting.product;

  const lineItem = useCartLines();
  console.log("lineItem",lineItem);

  const productExists = lineItem.some(item =>
    item.merchandise.id === variantID &&
    item.attributes.some(attr => attr.key === "GWP" && attr.value === "1")
  );

  console.log("product exist -", productExists)
 
  useEffect(() => {
    if (
      discountCode &&
      discountCode.length > 0 &&
      discountCode[0].code === useSetting.discount_code &&
      !isDiscountApplied &&
      !productExists
    ) {
      // console.log("discount code", discountCode);  
      console.log('variantID',variantID)
      applyCartLinesChange({
        type: 'addCartLine',
        merchandiseId: `${variantID}`,
        quantity: 1,
        attributes : [
          {
            key : "GWP",
            value : "1",
          }
        ]
      });
      setIsDiscountApplied(true);
    } else if ((!discountCode || discountCode.length === 0 || discountCode[0].code !== useSetting.discount_code) &&
    isDiscountApplied) {
      console.log("hello world 1");
      lineItem.forEach(function(ele){
        // console.log(ele.merchandise.id)
        if (ele.merchandise.id == variantID ){
          console.log("hello world")
          applyCartLinesChange({
            type: 'removeCartLine',
            id: ele.id,
            quantity: 1
          });
        setIsDiscountApplied(false);
        }
      }); 
    }
  }, [discountCode, isDiscountApplied, applyCartLinesChange,lineItem]);
  // 2. Check instructions for feature availability, see https://shopify.dev/docs/api/checkout-ui-extensions/apis/cart-instructions for details
  if (!instructions.attributes.canUpdateAttributes) {
    // For checkouts such as draft order invoices, cart attributes may not be allowed
    // Consider rendering a fallback UI or nothing at all, if the feature is unavailable
    return (
      <Banner title="GWP Product Option" status="warning">
        {translate("attributeChangesAreNotSupported")}
      </Banner>
    );
  }

  // 3. Render a UI
  return (
    <BlockStack border={"dotted"} padding={"tight"}>
      <Banner title="GWP Product Option">
        {translate("welcome", {
          target: <Text emphasis="italic">{extension.target}</Text>,
        })}
      </Banner>
      <Checkbox onChange={onCheckboxChange}>
        {translate("iWouldLikeAFreeGiftWithMyOrder")}
      </Checkbox>
    </BlockStack>
  );

  async function onCheckboxChange(isChecked: any) {
    // 4. Call the API to modify checkout
    const result = await applyAttributeChange({
      key: "requestedFreeGift",
      type: "updateAttribute",
      value: isChecked ? "yes" : "no",
    });
    console.log("applyAttributeChange result", result);
  }
}