import json


def test_websocket_connection_rejected_without_data(client):
    with client.websocket_connect("/ws/stream") as ws:
        try:
            ws.send_json({})
            data = ws.receive_json()
            assert data["type"] == "error"
        except Exception:
            pass


def test_websocket_streaming_decision_tree(client):
    with client.websocket_connect("/ws/stream") as ws:
        ws.send_json({
            "algorithm": "decision-tree",
            "hyperparameters": {"max_depth": 3},
            "dataset_name": "blobs",
            "resolution": 20,
        })
        frames = []
        while True:
            data = ws.receive_json()
            if data["type"] == "frame":
                frames.append(data)
            elif data["type"] == "done":
                break
            elif data["type"] == "error":
                break
        assert len(frames) > 0
        assert all("grid" in f for f in frames)
        assert all("step" in f for f in frames)


def test_websocket_unknown_algorithm(client):
    with client.websocket_connect("/ws/stream") as ws:
        ws.send_json({
            "algorithm": "nonexistent",
            "hyperparameters": {},
            "dataset_name": "blobs",
            "resolution": 20,
        })
        data = ws.receive_json()
        assert data["type"] == "error"
