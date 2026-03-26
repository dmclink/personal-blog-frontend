function formatDateString(dateString) {
	return new Date(dateString).toLocaleString('en-US');
}

export { formatDateString };
