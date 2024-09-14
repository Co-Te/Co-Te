import { ChangeEvent } from 'react'
import styled from '@emotion/styled'

interface SelectBoxProps {
	label?: string
	options: { key: string; value: string }[]
	placeholder?: string
	selectedValue: string
	disabled?: boolean
	handleChange: (e: ChangeEvent<HTMLSelectElement>) => void
}

const SelectBox = ({
	label,
	options,
	placeholder,
	selectedValue,
	disabled,
	handleChange,
}: SelectBoxProps) => {
	return (
		<div>
			{label && <Label>{label}</Label>}
			<Select value={selectedValue} onChange={handleChange} disabled={disabled}>
				<Option value="">{placeholder}</Option>
				{options.map((option) => (
					<Option key={`select_${option.key}`} value={option.key}>
						{option.value}
					</Option>
				))}
			</Select>
		</div>
	)
}

export default SelectBox

const Label = styled.label`
	font-size: 12px;
`

const Select = styled.select`
	height: 30px;
	width: 100%;
	border-radius: 8px;
	padding-left: 12px;
`

const Option = styled.option``
