from app.utils.constants import USER_ROLES


def validate_role(role: str) -> str:
    if role not in USER_ROLES:
        raise ValueError(f"Role must be one of: {', '.join(USER_ROLES)}")
    return role
