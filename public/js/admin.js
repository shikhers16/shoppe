const deleteProduct = btn => {
	const productID = btn.parentNode.querySelector('[name=productId]').value;
	const csrf = btn.parentNode.querySelector('[name=_csrf]').value;
	console.log(productID, csrf);
	const productElement = btn.closest('article');
	fetch(`/admin/products/${productID}`,
		{
			method: 'DELETE',
			headers: {
				'csrf-token': csrf
			}
		}).then((result) => {
			return result.json()
		}).then(data => {
			console.log(data);
			productElement.parentNode.removeChild(productElement);
		}
		)
		.catch(err => console.log(err.json()));
}