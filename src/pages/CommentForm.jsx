import { useAuth } from '../contexts/AuthContext';
import { useState, useRef } from 'react';
import usePost from '../hooks/usePost';
import Login from './Login';

function CommentForm(props) {
	const [comment, setComment] = useState('');

	const commentTextAreaRef = useRef(null);

	const authContext = useAuth();
	const user = authContext.user;

	const canComment = user && user.canComment;

	const { postData, error, isLoading, data } = usePost('/comments/create');

	//TODO: pass some shit down through props so we can submit this form ?
	//call in usePost and write a handler
	//

	const handleClick = async (e) => {
		e.preventDefault();
		try {
			const respData = await postData({ post_id: props.postId, content: commentTextAreaRef.current.value });
			console.log('Comment added:', respData);
			console.log('Refreshing post');
			props.refreshPost();
		} catch (err) {
			console.error(err);
		}
	};

	return (
		<>
			{canComment ? (
				<form>
					<textarea ref={commentTextAreaRef} cols="60" rows="5"></textarea>
					<button type="button" onClick={handleClick}>
						Add Comment
					</button>
				</form>
			) : (
				<p>must be logged in to comment</p>
			)}
		</>
	);
}

export default CommentForm;
