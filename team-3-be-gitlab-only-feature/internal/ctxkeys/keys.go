package ctxkeys

type (
	ctxKeyID     struct{}
	ctxKeyRoleID struct{}
	ctxKeyUserID struct{}
)

var (
	CtxKeyID     = ctxKeyID{}
	CtxKeyRoleID = ctxKeyRoleID{}
	CtxKeyUserID = ctxKeyUserID{}
)
