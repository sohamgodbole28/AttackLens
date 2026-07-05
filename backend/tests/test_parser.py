"""Tests for RequestParser."""

import pytest
from app.engine.parser import RequestParser
from app.exceptions import AttackLensError

def test_parse_raw_http():
    raw_req = (
        "POST /api/v1/users?id=5 HTTP/1.1\r\n"
        "Host: example.com\r\n"
        "Content-Type: application/json\r\n"
        "Cookie: session=12345; user=admin\r\n"
        "Content-Length: 17\r\n"
        "\r\n"
        '{"role": "admin"}'
    )
    parsed = RequestParser.parse_raw(raw_req)
    assert parsed.method == "POST"
    assert parsed.path == "/api/v1/users"
    assert parsed.query_params == {"id": "5"}
    assert parsed.headers["content-type"] == "application/json"
    assert parsed.cookies == {"session": "12345", "user": "admin"}
    assert parsed.body == {"role": "admin"}
    assert parsed.raw_body == b'{"role": "admin"}'

def test_parse_json_request():
    json_req = {
        "method": "GET",
        "path": "/users/1",
        "headers": {"Authorization": "Bearer token"},
        "query_params": {"debug": "true"},
    }
    parsed = RequestParser.parse_json(json_req)
    assert parsed.method == "GET"
    assert parsed.path == "/users/1"
    assert parsed.headers["authorization"] == "Bearer token"
    assert parsed.query_params["debug"] == "true"
    assert parsed.body is None

def test_parse_raw_invalid():
    with pytest.raises(AttackLensError):
        RequestParser.parse_raw("NOT HTTP AT ALL")

def test_header_normalization():
    raw_req_upper = "GET / HTTP/1.1\r\nCONTENT-TYPE: application/json\r\n\r\n"
    raw_req_lower = "GET / HTTP/1.1\r\ncontent-type: application/json\r\n\r\n"
    raw_req_mixed = "GET / HTTP/1.1\r\nContent-Type: application/json\r\n\r\n"
    
    parsed_upper = RequestParser.parse_raw(raw_req_upper)
    parsed_lower = RequestParser.parse_raw(raw_req_lower)
    parsed_mixed = RequestParser.parse_raw(raw_req_mixed)
    
    assert parsed_upper.headers["content-type"] == "application/json"
    assert parsed_lower.headers["content-type"] == "application/json"
    assert parsed_mixed.headers["content-type"] == "application/json"

def test_raw_and_json_parity():
    raw_req = (
        "PATCH /api/v2/admin/organizations/17/users/4832?include=permissions HTTP/1.1\r\n"
        "Host: app.example.com\r\n"
        "Authorization: Bearer test-token\r\n"
        "Content-Type: application/json\r\n"
        "Cookie: session=abc123\r\n"
        "\r\n"
        '{\n  "role":"admin",\n  "departmentId":5,\n  "userId":4832,\n  "organizationId":17,\n  "status":"active"\n}'
    )
    
    json_req = {
        "method": "PATCH",
        "path": "/api/v2/admin/organizations/17/users/4832",
        "headers": {
            "Authorization": "Bearer test-token",
            "Content-Type": "application/json"
        },
        "query_params": {
            "include": "permissions"
        },
        "cookies": {
            "session": "abc123"
        },
        "body": {
            "role": "admin",
            "departmentId": 5,
            "userId": 4832,
            "organizationId": 17,
            "status": "active"
        }
    }
    
    parsed_raw = RequestParser.parse_raw(raw_req)
    parsed_json = RequestParser.parse_json(json_req)
    
    assert parsed_raw.method == parsed_json.method
    assert parsed_raw.path == parsed_json.path
    assert parsed_raw.query_params == parsed_json.query_params
    assert parsed_raw.cookies == parsed_json.cookies
    assert parsed_raw.body == parsed_json.body
    assert parsed_raw.headers.get("authorization") == parsed_json.headers.get("authorization")
