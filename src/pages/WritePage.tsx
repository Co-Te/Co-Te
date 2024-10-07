import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ImagePlus, ArrowLeft } from 'lucide-react'
import styled from '@emotion/styled'
import colors from '@/constants/color'
import { fontSize, fontWeight } from '@/constants/font'
import Button from '@components/Button'
import RenderMarkdown from '@components/RenderMarkdown'
import SelectBox from '@components/SelectBox'
import axios from 'axios'

interface Post {
	title: string
	content: string
	category: string
	subCategory: string
}

const selectData = [
	{
		key: 'study',
		value: '스터디',
	},
]
const subData = {
	study: [
		{ key: 'cs', value: 'CS' },
		{ key: 'Algorithm', value: '알고리즘' },
	],
}
const postsData: Record<string, Post> = {
	1: {
		title: '나는 1번이다',
		content: '나는 1번이다 이건 테스트임',
		category: 'study',
		subCategory: 'cs',
	},
	2: {
		title: '나는 2번이다',
		content: '나는 2번이다 이건 아까와 똑같은 테스트임',
		category: 'study',
		subCategory: 'cs',
	},
}

const WritePage = () => {
	const navigate = useNavigate()
	const location = useLocation()
	const queryParams = new URLSearchParams(location.search)
	const id = queryParams.get('id')
	const fileRef = useRef<HTMLInputElement>(null)
	const readRef = useRef<HTMLDivElement>(null)
	const [markdownContent, setMarkdownContent] = useState('')
	const [title, setTitle] = useState('')
	const [selectedCategory, setSelectedCategory] = useState<string>('')
	const [selectedSubCategory, setSelectedSubCategory] = useState<string>('')
	const [isEditing, setIsEditing] = useState(false)

	const handleUploadFile = () => {
		if (fileRef.current) {
			fileRef.current.click()
		}
	}

	const handleBack = (e: React.MouseEvent) => {
		e.preventDefault()
		navigate(-1)
	}

	const uploadFile = async (file: File) => {
		try {
			const formData = new FormData()
			formData.append('file', file)

			const sessionId = localStorage.getItem('sessionId')

			const res = await axios.post(
				`http://nubble-backend-eb-1-env.eba-f5sb82hp.ap-northeast-2.elasticbeanstalk.com/files`,
				formData,
				{
					headers: {
						'Content-Type': 'multipart/form-data',
						'SESSION-ID': sessionId,
					},
				},
			)
			return res.data
		} catch (error) {
			console.error('파일 업로드 실패')
		}
	}

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files
		if (files) {
			const newImages: string[] = []

			for (const file of files) {
				try {
					const res = await uploadFile(file)
					newImages.push(`![](${res.baseUrl + res.fileName})`)
				} catch (error) {
					console.error('파일 업로드 중 오류 발생:', error)
				}
			}
			setMarkdownContent((prev) => prev + newImages.join('\n'))
		}
	}

	const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
		const items = e.clipboardData.items
		let newContent = markdownContent

		for (let item of items) {
			if (item.kind === 'file' && item.type.startsWith('image/')) {
				const file = item.getAsFile()
				if (file) {
					const res = await uploadFile(file)
					newContent += `![](${res.baseUrl + res.fileName})`
					e.preventDefault()
				}
			}
		}
		setMarkdownContent(newContent)
	}

	const handleContent = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setMarkdownContent(e.target.value)

		if (readRef.current) {
			readRef.current.scrollTop = readRef.current.scrollHeight
		}
	}

	const handleSelectedData = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setSelectedCategory(e.target.value)
		setSelectedSubCategory('')
	}

	const handleSubData = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setSelectedSubCategory(e.target.value)
	}

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()

		const formData = new FormData()
		formData.append('title', title)
		formData.append('content', markdownContent)
	}

	useEffect(() => {
		if (id) {
			setIsEditing(true)
			const post = postsData[id]
			if (post) {
				setTitle(post.title)
				setMarkdownContent(post.content)
				setSelectedCategory(post.category)
				setSelectedSubCategory(post.subCategory)
			}
		}
	}, [id])

	return (
		<Container>
			<form className="area-write" onSubmit={handleSubmit}>
				<input
					className="write-title"
					type="text"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					placeholder="제목을 입력하세요"
				/>
				<div className="gray-line" />
				<div className="area-choice">
					<input
						type="file"
						multiple
						ref={fileRef}
						style={{ display: 'none' }}
						onChange={handleFileChange}
					/>
					<IconButton onClick={handleUploadFile}>
						<ImagePlus size={30} />
						이미지 업로드
					</IconButton>
					<div className="select-category">
						<SelectBox
							options={selectData}
							selectedValue={selectedCategory}
							placeholder="카테고리 선택"
							handleChange={handleSelectedData}
						/>
						<SelectBox
							options={selectedCategory ? subData[selectedCategory as keyof typeof subData] : []}
							selectedValue={selectedSubCategory}
							placeholder="내용 선택"
							handleChange={handleSubData}
							disabled={!selectedCategory}
						/>
					</div>
				</div>
				<textarea
					className="content"
					placeholder="내용을 입력하세요."
					value={markdownContent}
					onChange={handleContent}
					onPaste={handlePaste}
				/>
				<div className="area-footer">
					<IconButton onClick={handleBack}>
						<ArrowLeft size={25} />
						나가기
					</IconButton>
					<div className="area-button">
						<Button variant="secondary" radius={50}>
							임시저장
						</Button>
						{isEditing ? (
							<Button radius={50}>수정하기</Button>
						) : (
							<Button radius={50} type="submit">
								등록하기
							</Button>
						)}
					</div>
				</div>
			</form>
			<div ref={readRef} className="area-read">
				<div className="title">{title}</div>
				<RenderMarkdown markdown={markdownContent} />
			</div>
		</Container>
	)
}

export default WritePage

const Container = styled.div`
	width: 100%;
	height: 100vh;
	display: flex;

	input::placeholder {
		color: ${colors.commentGray};
	}

	.content,
	.write-title {
		color: ${colors.white};
	}

	.content::-webkit-scrollbar,
	.area-read::-webkit-scrollbar {
		width: 8px;
	}

	.content::-webkit-scrollbar-thumb,
	.area-read::-webkit-scrollbar-thumb {
		background-color: ${colors.white};
		border-radius: 4px;
	}

	.area-write {
		position: relative;
		width: 100%;
		padding: 0px 30px;
		background-color: ${colors.bgBlack};
		padding-bottom: 70px;

		.write-title {
			width: 100%;
			font-size: ${fontSize.xxxxxl};
			font-weight: ${fontWeight.semiBold};
			background-color: inherit;
			outline: none;
			margin: 40px 0px 30px;
		}

		textarea {
			border: none;
			outline: none;
		}

		.content {
			width: 100%;
			overflow-y: auto;
			font-size: ${fontSize.lg};
			background-color: inherit;
			border: none;
			padding: 10px;
			resize: none;
			height: calc(100vh - 260px);
		}
	}

	.gray-line {
		width: 100%;
		height: 3px;
		background-color: ${colors.commentGray};
	}

	.area-choice,
	.area-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.area-choice {
		margin: 20px 0;

		.select-category {
			display: flex;
			gap: 10px;
		}
	}

	.area-exit {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.area-read {
		width: 100%;
		overflow-y: auto;
		flex-direction: column;
		padding: 40px;
		line-height: 1.3;
		background-color: ${colors.mainBlack};
		font-size: ${fontSize.md};

		.title {
			font-size: ${fontSize.xxxxxl};
			font-weight: ${fontWeight.semiBold};
			margin-bottom: 50px;
		}
	}

	.area-footer {
		width: 100%;
		height: 70px;
		position: absolute;
		padding: 0px 30px;
		background-color: ${colors.mainGray};
		left: 0;
		bottom: 0;
	}
`
const IconButton = styled.button`
	display: flex;
	align-items: center;
	gap: 8px;
	background-color: inherit;
	color: ${colors.commentGray};
	border: none;
	cursor: pointer;
	font-size: ${fontSize.lg};
	font-weight: ${fontWeight.regular};

	&:hover {
		color: ${colors.white};
	}
`
