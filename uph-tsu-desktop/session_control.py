import logging

active_sessions = {}

def validate_session(handler):
    logging.info(f"Request method: {handler.request.method}")
    if handler.request.method != 'POST':
        logging.info("Skipping validation on GET")
        return

    user = handler.kwargs.get('user')
    logging.info(f"user raw: {user}")

    # Extract username
    if hasattr(user, 'get'):
        username = user.get('user')
    elif hasattr(user, 'user'):
        username = user.user
    else:
        username = user

    logging.info(f"username: {username}")

    # if not username:
    #     raise Exception("Missing username during validation")

    session_id = handler.session.get('id')
    logging.info(f"session_id: {session_id}")

    if not session_id:
        raise Exception("Session ID missing")

    current = active_sessions.get(username)
    logging.info(f"current active session for user: {current}")

    if current and current != session_id:
        raise Exception("Concurrent login detected. Please logout from other device.")

    active_sessions[username] = session_id
    logging.info(f"Updated active_sessions: {active_sessions}")


def clear_session(handler):
    user = handler.current_user
    if user in active_sessions:
        del active_sessions[user]
    handler.session.clear_all()
    handler.redirect('/$YAMLURL/login')
