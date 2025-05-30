type Message<Subject extends string, Payload extends object> = {
	sender: string;
	recipient: string;
	subject: Subject;
	payload: Payload;
};

export { type Message };
