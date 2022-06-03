import { forwardRef } from "react";
import Cleave from "cleave.js/react";
import {ethers} from "ethers";
const {
  utils: { parseUnits },
  constants: { AddressZero },
} = ethers;
export default forwardRef((props, ref) => {
  const { decimals, onChange, label, options, value } = props;

  return (
    <div className="form-floating mb-3">
      <Cleave
        className="form-control"
        ref={ref}
        placeholder="0.0"
        value={( Number(value)/ Number(10n**BigInt(decimals))).toString()}
        options={{
          numeral: true,
          numeralDecimalScale: decimals,
          numeralThousandsGroupStyle: "thousand",
          ...options,
        }}
        onChange={(event) => {
          event.stopPropagation();

          onChange(
            event.target.rawValue === ""
              ? null
              : parseUnits(
                  event.target.rawValue.replace(/^\./g, "0."),
                  decimals
                ).toBigInt()
          );
        }}
      ></Cleave>
      <label htmlFor="inputAmount">{label}</label>
    </div>
  );
});
// };
