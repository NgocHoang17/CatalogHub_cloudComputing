import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 },  // 30 giây đầu: tăng lên 20 người dùng đồng thời
    { duration: '1m', target: 50 },   // 1 phút tiếp theo: duy trì 50 người dùng
    { duration: '30s', target: 0 },   // 30 giây cuối: hạ tải về 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% requests phản hồi dưới 500ms
  },
};

export default function () {
  const res = http.get('https://catalog-cloud-computing-production.up.railway.app/api/products/categories');
  check(res, {
    'status is 200': (r) => r.status === 200,
  });
  sleep(0.2); // Tần suất request
}