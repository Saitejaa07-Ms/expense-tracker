from tests.conftest import auth_headers


def first_category_id(client, headers):
    return client.get("/api/categories", headers=headers).json()[0]["id"]


def test_register_duplicate_email(client):
    body = {"email": "a@example.com", "password": "password123"}
    assert client.post("/api/auth/register", json=body).status_code == 201
    assert client.post("/api/auth/register", json=body).status_code == 409


def test_login_wrong_password(client):
    auth_headers(client)
    r = client.post(
        "/api/auth/login",
        json={"email": "user@example.com", "password": "wrong-password"},
    )
    assert r.status_code == 401


def test_requires_auth(client):
    assert client.get("/api/transactions").status_code == 401


def test_transaction_crud_and_monthly_summary(client):
    h = auth_headers(client)
    cat = first_category_id(client, h)

    created = client.post(
        "/api/transactions",
        headers=h,
        json={
            "description": "Salary",
            "amount": "1000.00",
            "transaction_type": "income",
            "transaction_date": "2026-03-01",
            "category_id": cat,
        },
    )
    assert created.status_code == 201

    expense = client.post(
        "/api/transactions",
        headers=h,
        json={
            "description": "Lunch",
            "amount": "250.50",
            "transaction_type": "expense",
            "transaction_date": "2026-03-02",
            "category_id": cat,
        },
    ).json()

    summary = client.get(
        "/api/analytics/monthly", headers=h, params={"year": 2026, "month": 3}
    ).json()
    assert float(summary["income"]) == 1000
    assert float(summary["expenses"]) == 250.5
    assert float(summary["balance"]) == 749.5

    updated = client.put(
        f"/api/transactions/{expense['id']}", headers=h, json={"amount": "100.00"}
    )
    assert updated.status_code == 200
    assert float(updated.json()["amount"]) == 100

    assert client.delete(f"/api/transactions/{expense['id']}", headers=h).status_code == 204
    assert len(client.get("/api/transactions", headers=h).json()) == 1


def test_users_cannot_access_each_others_data(client):
    h1 = auth_headers(client, "one@example.com")
    h2 = auth_headers(client, "two@example.com")
    cat1 = first_category_id(client, h1)

    tx = client.post(
        "/api/transactions",
        headers=h1,
        json={
            "description": "Private",
            "amount": "10",
            "transaction_type": "expense",
            "transaction_date": "2026-03-01",
            "category_id": cat1,
        },
    ).json()

    assert client.get("/api/transactions", headers=h2).json() == []
    assert client.put(f"/api/transactions/{tx['id']}", headers=h2, json={"amount": "1"}).status_code == 404
    assert client.delete(f"/api/transactions/{tx['id']}", headers=h2).status_code == 404

    # user 2 cannot attach a transaction to user 1's category
    r = client.post(
        "/api/transactions",
        headers=h2,
        json={
            "description": "Sneaky",
            "amount": "10",
            "transaction_type": "expense",
            "transaction_date": "2026-03-01",
            "category_id": cat1,
        },
    )
    assert r.status_code == 404
