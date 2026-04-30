# CourierXpress React UI

Giao diện React được tách thành nhiều file theo cấu trúc project chuẩn, bám theo database:

- branches
- users
- customers
- shipment_types
- shipments
- shipment_status_history
- bills

## Chạy project

```bash
npm install
npm run dev
```

## Cấu trúc chính

- `src/data/mockData.js`: dữ liệu mẫu theo database
- `src/pages/LoginPage.jsx`: màn hình đăng nhập
- `src/pages/PublicTrackingPage.jsx`: tra cứu tracking công khai
- `src/features/admin/*`: giao diện admin
- `src/features/agent/*`: giao diện agent
- `src/features/customer/*`: giao diện customer
- `src/components/*`: các component dùng lại
