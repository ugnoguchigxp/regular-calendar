export interface Personnel {
	id: string;
	name: string;
	department: string;
	email: string;
	priority: number; // -1=低, 0=通常, 1=高
	createdAt?: Date;
	updatedAt?: Date;
}
