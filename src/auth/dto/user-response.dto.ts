import { User } from "../user.entity";
import { UserRole } from "../users-role.enum";

export class UserResponseDto{
	email: string;
	role: UserRole;

	constructor(user: User){
		this.email = user.email;
		this.role = user.role;
	}
}