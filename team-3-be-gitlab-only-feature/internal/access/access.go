package access

var RoleVisibility = map[int][]int{
	1: {1, 2, 3, 4}, // Администратор
	2: {2, 3, 4},    // HR-специалист
	3: {3, 4},       // Менеджер
	4: {4},          // Специалист
}

func IsAccessible(docRoleID, roleID int) bool {
	allowed, ok := RoleVisibility[roleID]
	if !ok {
		return false
	}
	for _, r := range allowed {
		if r == docRoleID {
			return true
		}
	}
	return false
}
