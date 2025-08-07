import request from 'supertest';
import { expect } from 'chai';
import app from '../index.js';

// describe giúp nhóm các test lại với nhau
describe("Test get user", () => {
  // viết từng test case với it
  it("GET /api/users - Trả về danh sách người dùng", async () => {
    const res = await request(app).get("/posts/comments/66ebd9e52b9c5b20730ee70a");

    // console.log(res.status, res.body);
    expect(res.status).to.equal(200);
  })
})


