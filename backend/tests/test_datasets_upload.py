import io
import csv


def test_upload_csv(client):
    csv_content = "x1,x2,y\n1.0,2.0,0\n3.0,4.0,1\n5.0,6.0,0\n"
    file = io.BytesIO(csv_content.encode())
    response = client.post(
        "/api/datasets/upload",
        files={"file": ("test.csv", file, "text/csv")},
    )
    assert response.status_code == 200
    data = response.json()
    assert "session_id" in data
    assert data["columns"] == ["x1", "x2", "y"]
    assert data["n_rows"] == 3
    assert data["n_numeric_columns"] == 3


def test_upload_rejects_non_csv(client):
    file = io.BytesIO(b"not a csv")
    response = client.post(
        "/api/datasets/upload",
        files={"file": ("test.exe", file, "application/octet-stream")},
    )
    assert response.status_code == 400


def test_upload_rejects_formula(client):
    csv_content = "x1,y\n=cmd|'/C calc'!A0,1\n1.0,0\n"
    file = io.BytesIO(csv_content.encode())
    response = client.post(
        "/api/datasets/upload",
        files={"file": ("test.csv", file, "text/csv")},
    )
    assert response.status_code == 422


def test_map_columns(client):
    csv_content = "a,b,label\n1.0,2.0,0\n3.0,4.0,1\n5.0,6.0,0\n7.0,8.0,1\n"
    file = io.BytesIO(csv_content.encode())
    upload_resp = client.post(
        "/api/datasets/upload",
        files={"file": ("test.csv", file, "text/csv")},
    )
    session_id = upload_resp.json()["session_id"]

    response = client.post("/api/datasets/map-columns", json={
        "session_id": session_id,
        "x_columns": ["a", "b"],
        "y_column": "label",
    })
    assert response.status_code == 200
    data = response.json()
    assert "dataset_id" in data
    assert data["n_samples"] == 4
    assert data["n_features"] == 2
    assert "class_labels" in data


def test_custom_dataset(client):
    response = client.post("/api/datasets/custom", json={
        "points": [[1.0, 2.0], [3.0, 4.0], [5.0, 6.0], [7.0, 8.0]],
        "labels": [0, 1, 0, 1],
    })
    assert response.status_code == 200
    data = response.json()
    assert "dataset_id" in data
    assert data["n_samples"] == 4
    assert data["n_features"] == 2


def test_custom_dataset_mismatch(client):
    response = client.post("/api/datasets/custom", json={
        "points": [[1.0, 2.0], [3.0, 4.0]],
        "labels": [0, 1, 0],
    })
    assert response.status_code == 422


def test_recommend(client):
    response = client.post("/api/datasets/recommend", json={
        "dataset_name": "blobs",
        "n_samples": 300,
        "noise": 0.5,
    })
    assert response.status_code == 200
    data = response.json()
    assert "recommendations" in data
    assert len(data["recommendations"]) > 0
    assert all("name" in r and "label" in r and "confidence" in r and "reason" in r for r in data["recommendations"])
