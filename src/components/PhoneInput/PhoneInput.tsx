import * as React from "react";
import { FormEvent, PureComponent } from "react";
import InputMask from "react-input-mask";

interface IProps {
  onChange?: (e: FormEvent) => void;
}

export default class PhoneInput extends PureComponent<IProps> {
  public onChange = (e: FormEvent) => {
    const { onChange } = this.props;
    if (onChange) onChange(e);
  };

  public render() {
    return (
      <InputMask
        alwaysShowMask={true}
        mask="+7 (999) 999-99-99"
        onChange={this.onChange}
        className="ant-input"
        style={{ width: "200px" }}
      />
    );
  }
}
