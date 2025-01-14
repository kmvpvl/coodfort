export function URI2DataURL(url: string, successCB: (res: string | ArrayBuffer | null) => void, failCB?: (err: any) => void) {
	fetch(url, { mode: "cors", headers: { referer: "" } })
		.then(res => {
			console.log(res);
			return res.blob();
			//else {console.log(res.body); throw new Error("")}
		})
		.then(blob => {
			console.log("blob", blob);
			const reader = new FileReader();
			reader.onload = () => {
				successCB(reader.result);
			};
			reader.readAsDataURL(blob);
		})
		.catch(err => {
			console.log(err);
			if (failCB !== undefined) failCB(err);
		});
}
