import { useAuth } from '../contexts/AuthContext';
import { useState, useRef } from 'react';
import usePost from '../hooks/usePost';
import Login from './Login';

function CommentForm(props) {
	const [isWritingComment, setIsWritingComment] = useState(false);
	const [postError, setPostError] = useState(null);

	const commentTextAreaRef = useRef(null);

	const authContext = useAuth();
	const user = authContext.user;

	const canComment = user && user.canComment;

	const { postData } = usePost('/comments/create');

	const toggleIsWriting = () => {
		setIsWritingComment((prev) => !prev);
	};

	const handleClick = async (e) => {
		e.preventDefault();
		if (e.target.value === '') {
			setPostError('no empty comments! try typing something before submitting');
			return;
		}

		try {
			await postData({ post_id: props.postId, content: commentTextAreaRef.current.value });
			props.refreshPost();
			toggleIsWriting();
			setPostError(null);
		} catch (err) {
			console.error(err);
			setPostError(err.message);
		}
	};

	return (
		<>
			{canComment &&
				(isWritingComment ? (
					<>
						<form className="add-comment-form">
							<textarea ref={commentTextAreaRef} cols="60" rows="5"></textarea>
							<button className="add-comment-btn" type="button" onClick={handleClick}>
								Add Comment
							</button>
						</form>
						{postError && <p className="error-message">{postError}</p>}
					</>
				) : (
					<button className="comment-btn" onClick={toggleIsWriting}>
						Comment
					</button>
				))}
			{!canComment && (
				<p className="comments-verify-cta">You must verify your email to comment. Check your inbox</p>
			)}
		</>
	);
}

export default CommentForm;
