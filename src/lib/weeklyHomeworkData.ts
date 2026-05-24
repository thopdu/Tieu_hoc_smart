import { Grade, Subject } from '../types';

export interface WeeklyTopic {
  week: number;
  semester: 1 | 2;
  title: string;
  description: string;
}

// Generate weekly curriculum topics according to "Kết nối tri thức và cuộc sống" (KNTT) textbook series
export function getWeeklyTopics(grade: Grade, subject: Subject): WeeklyTopic[] {
  const topics: WeeklyTopic[] = [];

  for (let week = 1; week <= 35; week++) {
    const semester = week <= 18 ? 1 : 2;
    let title = '';
    let description = '';

    if (subject === 'Toán') {
      switch (grade) {
        case 1:
          if (week === 1) { title = 'Các số 1, 2, 3, 4, 5 (KNTT)'; description = 'Nhận biết, đọc viết các số trong phạm vi 5'; }
          else if (week === 2) { title = 'Các số 6, 7, 8, 9, 10'; description = 'Đọc, viết và so sánh các số trong phạm vi 10'; }
          else if (week === 3) { title = 'Nhiều hơn, ít hơn, bằng nhau'; description = 'So sánh số lượng nhóm vật bằng cách ghép cặp'; }
          else if (week === 4) { title = 'So sánh các số trong phạm vi 10'; description = 'Sử dụng các dấu lớn hơn (>), bé hơn (<), bằng (=)'; }
          else if (week === 5) { title = 'Hình tròn, tam giác, vuông, chữ nhật'; description = 'Nhận dạng các hình hình học đơn giản qua thực tế'; }
          else if (week === 6) { title = 'Khối lập phương, Khối hộp chữ nhật'; description = 'Lập diện, sờ nắn các hình khối 3D trực quan'; }
          else if (week === 7) { title = 'Phép cộng trong phạm vi 6'; description = 'Phép cộng gom nhóm vật, viết phép tính thích hợp'; }
          else if (week === 8) { title = 'Phép cộng trong phạm vi 10'; description = 'Tính nhẩm phép cộng, nối phép tính và kết quả'; }
          else if (week === 9) { title = 'Phép trừ trong phạm vi 6'; description = 'Bớt đi nhóm vật, viết sơ đồ phép trừ thích hợp'; }
          else if (week === 10) { title = 'Phép trừ trong phạm vi 10'; description = 'Tính nhẩm thực tế phép trừ phạm vi 10'; }
          else if (week === 11) { title = 'Bảng cộng trừ phạm vi 10'; description = 'Luyện tập tổng hợp cộng trừ và bài toán tranh'; }
          else if (week === 12) { title = 'Đo độ dài: Gang tay, Bước chân'; description = 'Khái niệm đo lường sơ khai bằng đơn vị tự quy ước'; }
          else if (week === 13) { title = 'Xăng-ti-mét và Thước thẳng'; description = 'Nhận diện vạch chia cm, tập kẻ đoạn thẳng có độ dài cho trước'; }
          else if (week === 14) { title = 'Các số 11, 12, 13, 14, 15, 16'; description = 'Học đếm, cấu tạo số chục và số đơn vị sơ đẳng'; }
          else if (week === 15) { title = 'Các số từ 17 đến 20'; description = 'Luyện tập đếm tới 20, điền số còn thiếu vào dãy số'; }
          else if (week === 16) { title = 'Phép cộng dạng 14 + 3, trừ dạng 17 - 2'; description = 'Tính không nhớ trong phạm vi 20 theo cột dọc'; }
          else if (week === 17) { title = 'Bài toán Cộng/Trừ có lời văn ngắn'; description = 'Đọc truyện, điền phép tính và câu trả lời'; }
          else if (week === 18) { title = 'Ôn tập học kỳ I tổng hợp'; description = 'Kiểm tra toàn diện kiến thức số học và hình học học kỳ 1'; }
          else if (week === 19) { title = 'Các số tròn chục (10, 20...90)'; description = 'Nhận biết số chục, viết chục và đơn vị'; }
          else if (week === 20) { title = 'Phép cộng, trừ các số tròn chục'; description = 'Cộng trừ nhẩm nhanh theo số chục dễ dàng'; }
          else if (week === 21) { title = 'Các số có hai chữ số (từ 21 đến 50)'; description = 'Đọc số, viết số dạng hàng chục và hàng đơn vị'; }
          else if (week === 22) { title = 'Các số có hai chữ số (từ 51 đến 99)'; description = 'Biết viết các số lớn đến 99, số liền trước, liền sau'; }
          else if (week === 23) { title = 'So sánh các số có hai chữ số'; description = 'Quy tắc so sánh chữ số hàng chục rồi tới hàng đơn vị'; }
          else if (week === 24) { title = 'Bảng các số từ 1 đến 100'; description = 'Nắm vững quy luật thứ tự trong bảng 100'; }
          else if (week === 25) { title = 'Dài hơn, ngắn hơn'; description = 'So sánh trực quan độ dài các đồ vật xung quanh'; }
          else if (week === 26) { title = 'Đoạn thẳng và độ dài đoạn thẳng'; description = 'Tập dùng thước đo các hình vẽ trong vở bài tập'; }
          else if (week === 27) { title = 'Ngày trong tuần, Thứ trong tuần'; description = 'Đọc và sắp xếp thứ tự các ngày từ Thứ Hai đến Chủ Nhật'; }
          else if (week === 28) { title = 'Đồng hồ và Giờ đúng (KNTT)'; description = 'Tập xem kim ngắn chỉ giờ đúng khi kim dài chỉ số 12'; }
          else if (week === 29) { title = 'Phép cộng không nhớ phạm vi 100'; description = 'Cộng số có 2 chữ số với số có 2 chữ số nhanh chóng'; }
          else if (week === 30) { title = 'Phép trừ không nhớ phạm vi 100'; description = 'Đặt tính rồi tính trừ không nhớ, viết thẳng hàng'; }
          else if (week === 31) { title = 'Luyện tập cộng trừ không nhớ'; description = 'Ôn luyện cộng trừ, nhận diện đề tìm độ dài còn thiếu'; }
          else if (week === 32) { title = 'Ôn tập Các số và Hình học'; description = 'Nhận diện hình phẳng và đếm các số lớn'; }
          else if (week === 33) { title = 'Ôn tập Phép cộng, phép trừ'; description = 'Giải bài toán có lời văn cộng trừ phạm vi 100'; }
          else if (week === 34) { title = 'Đề minh họa kiểm tra cuối năm'; description = 'Làm quen dạng đề thi chính thức chuẩn phòng Giáo dục'; }
          else { title = 'Kiểm tra, Đánh giá năng lực cuối năm'; description = 'Tổng kết toàn diện kiến thức Toán Lớp 1 KNTT'; }
          break;

        case 2:
          if (week === 1) { title = 'Ôn tập các số đến 100'; description = 'Củng cố cách đọc viết, cấu tạo số chục đơn vị lớp 1'; }
          else if (week === 2) { title = 'Ôn tập Phép cộng, phép trừ (không nhớ)'; description = 'Tính toán nhẩm lại cộng trừ phạm vi 100'; }
          else if (week === 3) { title = 'Tia số và Số liền trước, số liền sau'; description = 'Biết cách biểu diễn số trên tia, tìm khoảng cách'; }
          else if (week === 4) { title = 'Đề-xi-mét (dm) và Thước đo'; description = 'Mối quan hệ giữa dm và cm (1 dm = 10 cm)'; }
          else if (week === 5) { title = 'Phép cộng có nhớ phạm vi 20 (Dạng 9 + 5)'; description = 'Tách số để cộng tròn chục rồi tính tiếp'; }
          else if (week === 6) { title = 'Phép cộng có nhớ phạm vi 20 (Dạng 8 + 5, 7 + 5)'; description = 'Tiếp tục luyện kỹ năng nhẩm qua mười'; }
          else if (week === 7) { title = 'Phép trừ có nhớ phạm vi 20 (Dạng 11 - 5)'; description = 'Tính trừ bằng cách bớt qua trục mười'; }
          else if (week === 8) { title = 'Phép trừ có nhớ phạm vi 20 (Dạng 12-5, 13-5)'; description = 'Luyện tính nhanh trừ có nhớ phản xạ tự nhiên'; }
          else if (week === 9) { title = 'Bài toán nhiều hơn, ít hơn'; description = 'Cách tóm tắt sơ đồ đoạn thẳng giải toán thực tế'; }
          else if (week === 10) { title = 'Ki-lô-gam (kg) và quả cân'; description = 'Khái niệm đo khối lượng, thực hành cân thăng bằng'; }
          else if (week === 11) { title = 'Lít (l) và đong nước'; description = 'Đơn vị đo dung tích vật lỏng thông dụng'; }
          else if (week === 12) { title = 'Hình tứ giác, hình đường gấp khúc'; description = 'Nhận biết hình, tính độ dài đường gấp khúc bằng tổng các cạnh'; }
          else if (week === 13) { title = 'Phép cộng có nhớ phạm vi 100'; description = 'Cộng số có hai chữ số theo hàng dọc có nhớ sang hàng chục'; }
          else if (week === 14) { title = 'Phép trừ có nhớ phạm vi 100'; description = 'Mượn một ở hàng chục khi trừ hàng đơn vị có nhớ'; }
          else if (week === 15) { title = 'Luyện tập chung cộng trừ phạm vi 100'; description = 'Tổng hợp các bài toán tìm X, điền dấu thích hợp'; }
          else if (week === 16) { title = 'Ngày - Tháng & Xem Lịch năm'; description = 'Tính số ngày trong tháng, xem thứ ngày lễ lớn'; }
          else if (week === 17) { title = 'Xem Giờ chuẩn và Giờ kém (Đồng hồ)'; description = 'Nhận biết kim phút chỉ số 3 (15 phút), số 6 (30 phút)'; }
          else if (week === 18) { title = 'Ôn tập học kỳ I tổng hợp'; description = 'Khảo sát chất lượng bán niên môn Toán Lớp 2 KNTT'; }
          else if (week === 19) { title = 'Phép nhân - Khái niệm ban đầu'; description = 'Chuyển đổi tổng của các số hạng bằng nhau thành phép nhân'; }
          else if (week === 20) { title = 'Thừa số, Tích'; description = 'Gọi tên các thành phần trong biểu thức nhân'; }
          else if (week === 21) { title = 'Bảng nhân 2 và Bảng nhân 5'; description = 'Học thuộc lòng bảng nhân bám sát bài tập trắc nghiệm'; }
          else if (week === 22) { title = 'Phép chia - Khái niệm ban đầu'; description = 'Chia thành các phần bằng nhau, từ phép nhân viết phép chia'; }
          else if (week === 23) { title = 'Số bị chia, Số chia, Thương'; description = 'Nhận dạng cấu trúc và gọi tên thành phần phép chia'; }
          else if (week === 24) { title = 'Bảng chia 2 và Bảng chia 5'; description = 'Thực hành tính chia ngược từ bảng nhân đã học'; }
          else if (week === 25) { title = 'Giờ, Phút và bài toán thời gian'; description = 'Tính thời gian di chuyển, hoạt động hàng ngày con'; }
          else if (week === 26) { title = 'Các số có ba chữ số đến 500'; description = 'Nhận biết Trăm, Chục, Đơn vị, đọc số chuẩn'; }
          else if (week === 27) { title = 'Các số từ 501 đến 1000'; description = 'Cách đọc viết các số tròn trăm, so sánh các số lớn'; }
          else if (week === 28) { title = 'So sánh các số có ba chữ số'; description = 'So sánh từ hàng trăm, hàng chục đến hàng đơn vị'; }
          else if (week === 29) { title = 'Mét (m) và Ki-lô-mét (km)'; description = 'Biết quy đổi đơn vị: 1m = 100cm, 1km = 1000m'; }
          else if (week === 30) { title = 'Mi-li-mét (mm) - Đơn vị đo siêu nhỏ'; description = 'Nhận diện mm trên thước thẳng thực hành đo vật nhỏ'; }
          else if (week === 31) { title = 'Phép cộng không nhớ phạm vi 1000'; description = 'Đặt tính dọc cộng 3 chữ số thẳng hàng cẩn thận'; }
          else if (week === 32) { title = 'Phép trừ không nhớ phạm vi 1000'; description = 'Thực hành đặt tính trừ 3 chữ số nhanh và chuẩn xác'; }
          else if (week === 33) { title = 'Ôn tập phép nhân và phép chia'; description = 'Luyện tập kết hợp bảng nhân chia 2, 5 và bài toán đố'; }
          else if (week === 34) { title = 'Ôn tập hình học và Đo lường cuối năm'; description = 'Đoạn thẳng, gấp khúc, diện tích đo lường kiểm tra thử'; }
          else { title = 'Kiểm tra cuối năm học tổng hợp'; description = 'Đánh giá xếp loại năng lực Toán Lớp 2 năm học mới'; }
          break;

        case 3:
          if (week === 1) { title = 'Ôn tập đọc viết số phạm vi 1000'; description = 'Ôn tập cấu tạo số tròn trăm, tròn chục lớp 2'; }
          else if (week === 2) { title = 'Cộng, trừ phạm vi 1000 (Có nhớ)'; description = 'Luyện ôn kỹ năng cộng trừ 3 chữ số nhanh'; }
          else if (week === 3) { title = 'Bảng nhân 3, Bảng chia 3 (KNTT)'; description = 'Tính toán, học thuộc lòng bảng 3 và các ứng dụng'; }
          else if (week === 4) { title = 'Bảng nhân 4, Bảng chia 4'; description = 'Bài tập thực hành nhân chia 4 sinh động'; }
          else if (week === 5) { title = 'Bảng nhân 6, Bảng chia 6'; description = 'Làm quen nhân chia mức độ nâng cao lớp 3'; }
          else if (week === 6) { title = 'Bảng nhân 7, Bảng chia 7'; description = 'Bài tập tính toán, nhân chia 7 nhanh'; }
          else if (week === 7) { title = 'Bảng nhân 8, Bảng chia 8'; description = 'Ghi nhớ nhân chia 8 chính xác'; }
          else if (week === 8) { title = 'Bảng nhân 9, Bảng chia 9'; description = 'Hoàn thành toàn bộ kỹ năng nhân chia cơ bản'; }
          else if (week === 9) { title = 'Gấp/Giảm một số đi một số lần'; description = 'Biết phân biệt tăng thêm một số đơn vị và gấp lên một số lần'; }
          else if (week === 10) { title = 'Góc vuông, Góc không vuông'; description = 'Khái niệm góc dùng ê-ke kiểm tra trực tiếp hình học'; }
          else if (week === 11) { title = 'Hình tròn, tâm, đường kính, bán kính'; description = 'Sử dụng compa vẽ hình tròn, hiểu d = 2r'; }
          else if (week === 12) { title = 'Phép chia hết và Phép chia có dư'; description = 'Số dư luôn nhỏ hơn số chia, cách thử lại kết quả'; }
          else if (week === 13) { title = 'Nhân số có 2 chữ số với số có 1 chữ số'; description = 'Tính nhẩm đặt phép nhân có nhớ cực chi tiết'; }
          else if (week === 14) { title = 'Chia số có 2 chữ số cho số có 1 chữ số'; description = 'Thực hành chia từ trái qua phải có dư hoặc hết'; }
          else if (week === 15) { title = 'Tính giá trị của biểu thức số'; description = 'Quy tắc nhân chia trước, cộng trừ sau; có ngoặc làm trước'; }
          else if (week === 16) { title = 'Làm tròn số đến hàng chục, hàng trăm'; description = 'Ứng dụng làm tròn số trong đời sống'; }
          else if (week === 17) { title = 'Khả năng xảy ra của một sự kiện'; description = 'Khái niệm xác suất sơ khai: chắc chắn, có thể, không thể'; }
          else if (week === 18) { title = 'Ôn tập kiểm tra tổng hợp học kỳ I'; description = 'Luyện đề thi học kỳ toán 3 đạt điểm số tối đa'; }
          else if (week === 19) { title = 'Các số có bốn chữ số (đến 10.000)'; description = 'Đọc viết và cấu tạo số hàng nghìn'; }
          else if (week === 20) { title = 'So sánh các số trong phạm vi 10.000'; description = 'So sánh giá trị số hàng nghìn rồi đến hàng trăm'; }
          else if (week === 21) { title = 'Phép cộng, trừ phạm vi 10.000'; description = 'Tính toán phạm vi nghìn có nhớ siêu chuẩn'; }
          else if (week === 22) { title = 'Các số có năm chữ số (đến 100.000)'; description = 'Thêm hàng chục nghìn vào hệ đếm thập phân'; }
          else if (week === 23) { title = 'So sánh các số trong phạm vi 100.000'; description = 'Bài tập sắp xếp dãy số lớn tăng/giảm dần'; }
          else if (week === 24) { title = 'Phép cộng, trừ trong phạm vi 100.000'; description = 'Luyện tính nhanh cộng trừ số lớn bảo toàn số dư'; }
          else if (week === 25) { title = 'Nhân số có năm chữ số với số có một chữ số'; description = 'Đặt tính nhân tuần tự có nhớ nâng cao'; }
          else if (week === 26) { title = 'Chia số có năm chữ số cho số có một chữ số'; description = 'Chia từng chữ số từ trái qua phải, theo dõi số dư'; }
          else if (week === 27) { title = 'Xem đồng hồ chính xác đến từng phút'; description = 'Nhận biết 1 giờ có 60 phút, xem đồng hồ điện tử'; }
          else if (week === 28) { title = 'Nhiệt độ và Nhiệt kế'; description = 'Đơn vị độ C, đọc chỉ số trên nhiệt kế y tế'; }
          else if (week === 29) { title = 'Tiền Việt Nam thông dụng'; description = 'Cộng trừ các tờ tiền giấy, tiền xu mệnh giá nhỏ'; }
          else if (week === 30) { title = 'Thống kê số liệu cơ bản'; description = 'Xem bảng số liệu, tìm số lớn nhất, nhỏ nhất, trung bình'; }
          else if (week === 31) { title = 'Diện tích của một hình, xăng-ti-mét vuông'; description = 'Khái niệm đơn vị diện tích cm2'; }
          else if (week === 32) { title = 'Diện tích hình chữ nhật, hình vuông'; description = 'Công thức tính S hình chữ nhật d x r, hình vuông c x c'; }
          else if (week === 33) { title = 'Chu vi hình chữ nhật, chu vi hình vuông'; description = 'Công thức tính chu vi P chu vi hình thù thực tế'; }
          else if (week === 34) { title = 'Khảo sát chất lượng đề tổng hợp cuối năm'; description = 'Giải toán ôn luyện cuối cấp học kỳ II'; }
          else { title = 'Kiểm tra sát hạch cuối năm học'; description = 'Bài thi tổng kết thành tích học tập lớp 3'; }
          break;

        case 4:
          if (week === 1) { title = 'Ôn tập số học & Phép tính chuẩn (Bài 1, 2)'; description = 'Củng cố cách đọc, viết, đặt tính cộng trừ nhân chia trong phạm vi 100.000'; }
          else if (week === 2) { title = 'Số chẵn, Số lẻ & Biểu thức chứa chữ (Bài 3, 4)'; description = 'Nhận diện tính chất tính chẵn lẻ và làm quen với tính giá trị biểu thức chữ'; }
          else if (week === 3) { title = 'Giải toán ba bước tính & Luyện tập (Bài 5, 6)'; description = 'Phương pháp sơ đồ tư duy giải quyết bài toán phức hợp có ba bước tính'; }
          else if (week === 4) { title = 'Đo góc, góc nhọn, góc tù, góc bẹt (Bài 7, 8)'; description = 'Nhận diện trực quan góc bẹt, góc tù, góc nhọn và thực hành dùng ê-ke'; }
          else if (week === 5) { title = 'Số có sáu chữ số & Hàng và lớp (Bài 9, 10, 11)'; description = 'Khái niệm số 1.000.000, cấu tạo phân tích hàng và lớp của số lớn'; }
          else if (week === 6) { title = 'Số lớp triệu & Làm tròn trăm nghìn (Bài 12, 13)'; description = 'Nhìn nhận cấu trúc lớp triệu và rèn luyện kỹ năng làm tròn số lớn'; }
          else if (week === 7) { title = 'So sánh các số & Dãy số tự nhiên (Bài 14, 15, 16)'; description = 'So sánh số có nhiều chữ số và tìm hiểu đặc điểm của dãy số tự nhiên'; }
          else if (week === 8) { title = 'Yến, Tạ, Tấn & Diện tích mét vuông (Bài 17, 18)'; description = 'Khái niệm và quy đổi các đơn vị đo khối lượng lớn và diện tích vuông'; }
          else if (week === 9) { title = 'Giây, Thế kỉ & Thực hành đo lường (Bài 19, 20)'; description = 'Bảng đơn vị đo thời gian lớn và bài toán thực tế dùng dụng cụ đo đạc'; }
          else if (week === 10) { title = 'Luyện tập chung & Phép cộng số lớn (Bài 21, 22)'; description = 'Củng cố đo lường và thực hiện phép cộng số có nhiều chữ số có nhớ'; }
          else if (week === 11) { title = 'Phép trừ số lớn & Tính chất phép cộng (Bài 23, 24)'; description = 'Đặt tính trừ số có nhiều chữ số, áp dụng tính chất giao hoán, kết hợp'; }
          else if (week === 12) { title = 'Tìm hai số khi biết Tổng và Hiệu (Bài 25, 26)'; description = 'Phương pháp tìm số lớn và số bé dựa trên công thức tổng - hiệu số học'; }
          else if (week === 13) { title = 'Hai đường thẳng vuông góc & Vẽ góc (Bài 27, 28)'; description = 'Định nghĩa quan hệ vuông góc và thực hành vẽ hai đường vuông góc chuẩn'; }
          else if (week === 14) { title = 'Hai đường thẳng song song & Vẽ (Bài 29, 30)'; description = 'Khái niệm quan hệ song song, các bước vẽ đường song song bằng thước ê-ke'; }
          else if (week === 15) { title = 'Hình bình hành, Hình thoi & Luyện (Bài 31, 32)'; description = 'Khái niệm, cấu tạo cạnh góc, thực hành cộng trừ đo diện tích cơ bản'; }
          else if (week === 16) { title = 'Ôn tập số lớp triệu, phép tính Học kì I (Bài 33, 34)'; description = 'Tổng thảo bài tập về hệ đếm triệu và cấu trúc tính toán số học'; }
          else if (week === 17) { title = 'Ôn tập hình học & Đo lường các tạ tấn (Bài 35, 36)'; description = 'Hệ thống hóa kiến thức hình vuông, chữ nhật, đo lường, thời gian thế kỉ'; }
          else if (week === 18) { title = 'Đề thi học kỳ I chuẩn cấu trúc KNTT (Bài 37)'; description = 'Đánh giá năng lực toàn diện chương trình Toán lớp 4 Học kỳ 1'; }
          else if (week === 19) { title = 'Nhân, chia số có một chữ số (Bài 38, 39)'; description = 'Phép nhân đặt tính chia dọc số có nhiều chữ số cho số có một chữ số'; }
          else if (week === 20) { title = 'Tính chất phép nhân, Nhân chia 10,100 (Bài 40, 41)'; description = 'Nhẩm nhân chia nhanh với số tròn và củng cố tính chất giao hoán kết hợp'; }
          else if (week === 21) { title = 'Tính chất phân phối & Nhân hai chữ số (Bài 42, 43)'; description = 'Nhân phân phối phép cộng và cách viết lùi tích riêng thứ hai có hai chữ số'; }
          else if (week === 22) { title = 'Chia hai chữ số & Thương có số 0 (Bài 44, 45, 46)'; description = 'Ước lượng thương chia số lớn cho số có hai chữ số, thương chứa số 0'; }
          else if (week === 23) { title = 'Khái niệm phân số & Phép chia (Bài 47, 48)'; description = 'Nhận biết tử số, mẫu số, viết thương của số tự nhiên dưới dạng phân số'; }
          else if (week === 24) { title = 'Phân số bằng nhau, rút gọn, quy đồng (Bài 49, 50, 51)'; description = 'Nhân chia cùng thừa số để tạo phân số bằng nhau, đưa về phân số tối giản'; }
          else if (week === 25) { title = 'So sánh phân số cùng và khác mẫu (Bài 52, 53, 54)'; description = 'Cách quy đồng mẫu số để so sánh hai phân số, sắp xếp tăng giảm'; }
          else if (week === 26) { title = 'Phép cộng các phân số chuẩn mực (Bài 55)'; description = 'Thực hiện cộng phân số cùng mẫu hoặc khác mẫu bằng quy đồng mẫu số'; }
          else if (week === 27) { title = 'Phép trừ các phân số chuẩn KNTT (Bài 56, 57)'; description = 'Thực hành trừ phân số cùng mẫu hoặc khác mẫu, luyện tập vận dụng'; }
          else if (week === 28) { title = 'Phép nhân phân số & Phép chia phân số (Bài 58, 60)'; description = 'Tính tích tử nhân tử mẫu nhân mẫu, và chia bằng nhân đảo ngược'; }
          else if (week === 29) { title = 'Tìm phân số của một số & Ôn luyện (Bài 61, 62)'; description = 'Giải toán đố tìm giá trị phân số của một đại lượng cho trước'; }
          else if (week === 30) { title = 'Dấu hiệu chia hết cho 2, 5, 3, 9 (Bài 63, 64, 65)'; description = 'Ứng dụng các quy tắc chữ số tận cùng và tổng chữ số để chia hết'; }
          else if (week === 31) { title = 'Khoảng cách tỉ lệ bản đồ (Bài 67, 68)'; description = 'Khái niệm tỉ lệ xích bản đồ và quy đổi kích thước thực tế tế nhị'; }
          else if (week === 32) { title = 'Tìm số trung bình cộng chuẩn mực (Bài 66)'; description = 'Tìm tổng các số hạng rồi chia cho số lượng số hạng tương ứng'; }
          else if (week === 33) { title = 'Biểu đồ cột & Thống kê số liệu (Bài 69, 70, 71)'; description = 'Thu thập thông tin, đọc biểu đồ cột và tính toán xác suất đơn giản'; }
          else if (week === 34) { title = 'Ôn tập tính chất phân số & phép tính học kì II (Bài 72)'; description = 'Hệ thống hóa toàn bộ kiến thức tính toán học kỳ II lớp 4'; }
          else { title = 'Thử sức Đề thi cuối năm học lớp 4 (Bài 73)'; description = 'Hoàn tất chuỗi ôn luyện cả năm học, sẵn sàng lên lớp 5'; }
          break;

        case 5:
        default:
          if (week === 1) { title = 'Ôn tập tính chất cơ bản của phân số'; description = 'Củng cố rút gọn, quy đồng phân số lớp 4'; }
          else if (week === 2) { title = 'Hỗn số - Khái niệm & Cách đổi'; description = 'Biết cách chuyển hỗn số sang phân số và ngược lại'; }
          else if (week === 3) { title = 'Khái niệm Số thập phân'; description = 'Nhận biết phần nguyên, phần thập phân, dấu phẩy'; }
          else if (week === 4) { title = 'Hàng của số thập phân, Đọc viết'; description = 'Hiểu các hàng mười, trăm, nghìn của phần thập phân'; }
          else if (week === 5) { title = 'So sánh hai số thập phân'; description = 'So sánh phần nguyên trước, sau đó đến phần thập phân'; }
          else if (week === 6) { title = 'Viết số đo đại lượng dưới dạng số thập phân'; description = 'Đổi m, km, kg sang số thập phân tiện dung'; }
          else if (week === 7) { title = 'Phép cộng các số thập phân'; description = 'Đặt tính dấu phẩy thẳng hàng cực quan trọng'; }
          else if (week === 8) { title = 'Phép trừ các số thập phân'; description = 'Thực hiện trừ thẳng hàng dấu phẩy'; }
          else if (week === 9) { title = 'Nhân số thập phân với số tự nhiên'; description = 'Nhân như số tự nhiên rồi đếm phần thập phân định vị'; }
          else if (week === 10) { title = 'Nhân số thập phân với số thập phân'; description = 'Xác định số chữ số sau dấu phẩy của hai thừa số'; }
          else if (week === 11) { title = 'Chia số thập phân cho số tự nhiên'; description = 'Khi chia đến phần thập phân phải viết dấu phẩy ở thương'; }
          else if (week === 12) { title = 'Chia số tự nhiên cho số tự nhiên có dư'; description = 'Viết thêm chữ số 0 để chia tiếp lấy số thập phân'; }
          else if (week === 13) { title = 'Chia một số cho một số thập phân'; description = 'Dịch chuyển dấu phẩy số chia và số bị chia tương ứng'; }
          else if (week === 14) { title = 'Tỉ số phần trăm'; description = 'Khái niệm phần trăm (%), chuyển phân số sang %'; }
          else if (week === 15) { title = 'Giải toán về Tỉ số phần trăm (Dạng 1)'; description = 'Tìm tỉ số phần trăm của hai số'; }
          else if (week === 16) { title = 'Giải toán về Tỉ số phần trăm (Dạng 2, 3)'; description = 'Tìm giá trị % của một số và tìm một số khi biết %'; }
          else if (week === 17) { title = 'Hình tam giác - Diện tích tam giác'; description = 'Công thức S = (a x h) / 2 (đáy nhân chiều cao chia hai)'; }
          else if (week === 18) { title = 'Đề ôn tập Tổng hợp học kỳ I'; description = 'Chuẩn bị cho bài thi học kỳ Đạt điểm 10'; }
          else if (week === 19) { title = 'Hình thang - Diện tích hình thang'; description = 'S = (a + b) x h / 2 (tổng hai đáy nhân chiều cao chia hai)'; }
          else if (week === 20) { title = 'Hình tròn - Chu vi & Diện tích'; description = 'C = d x 3.14 (hoặc 2 x r x 3.14); S = r x r x 3.14'; }
          else if (week === 21) { title = 'Hình hộp chữ nhật & Hình lập phương'; description = 'Nhận diện số đỉnh, cạnh, mặt của các khối hình học'; }
          else if (week === 22) { title = 'Diện tích xung quanh & Diện tích toàn phần'; description = 'Công thức tính Sxq, Stp hình hộp chữ nhật'; }
          else if (week === 23) { title = 'Thể tích - Đơn vị xăng-ti-mét khối (cm3)'; description = 'Lập thể tích không gian đo lường khối'; }
          else if (week === 24) { title = 'Đề-xi-mét khối (dm3) và Mét khối (m3)'; description = 'Quy đổi 1m3 = 1000dm3, 1dm3 = 1000cm3'; }
          else if (week === 25) { title = 'Thể tích hình hộp chữ nhật & lập phương'; description = 'V = a x b x c (Dài x Rộng x Cao) thẳng hàng'; }
          else if (week === 26) { title = 'Bảng đơn vị đo thời gian'; description = 'Cộng trừ các số đo thời gian phút, giây nâng cao'; }
          else if (week === 27) { title = 'Phép nhân & chia số đo thời gian'; description = 'Quy đổi phần dư thời gian sang đơn vị nhỏ hơn'; }
          else if (week === 28) { title = 'Bài toán Chuyển động đều - Vận tốc'; description = 'Công thức V = S / t (Quãng đường chia Thời gian)'; }
          else if (week === 29) { title = 'Quãng đường và Thời gian chuyển động'; description = 'S = v x t; t = S / v tính toán chuyển đổi đơn vị'; }
          else if (week === 30) { title = 'Hai chuyển động cùng chiều, ngược chiều'; description = 'Tính thời gian gặp nhau t = S / (v1 + v2) ngược chiều'; }
          else if (week === 31) { title = 'Ôn tập về Số tự nhiên và Số thập phân'; description = 'Củng cố tổng hợp đọc viết, tính chất bám sát thi'; }
          else if (week === 32) { title = 'Ôn tập về Các phép tính số học'; description = 'Phép toán tổng hợp tìm ẩn số trong đề bài'; }
          else if (week === 33) { title = 'Ôn tập Hình học & Đo lường nâng cao'; description = 'Xử lý các bài toán diện tích thể tích hỗn hợp'; }
          else if (week === 34) { title = 'Luyện đề thi thử tốt nghiệp Tiểu học'; description = 'Làm quen dạng đề khảo sát chất lượng đầu vào cấp hai'; }
          else { title = 'Đánh giá năng lực cuối cấp tiểu học'; description = 'Hoàn thành chặng đường tiểu học xuất sắc!'; }
          break;
      }
    } else if (subject === 'Tiếng Việt') {
      switch (grade) {
        case 1:
          if (week === 1) { title = 'Nhận diện âm: a, b, c, d'; description = 'Phát âm đúng các âm cơ bản, nhận biết chữ cái'; }
          else if (week === 2) { title = 'Học vần: e, ê, i, o'; description = 'Tập đọc trơn các vần đơn dạng e, ê ráp với phụ âm'; }
          else if (week === 3) { title = 'Ghép vần và Tập viết chữ thường'; description = 'Cách viết đúng ô ly các chữ cái vừa học'; }
          else if (week === 4) { title = 'Chủ đề: Nhà của em'; description = 'Các từ ngữ gần gũi về bố mẹ, bàn ghế, ngôi nhà'; }
          else if (week === 5) { title = 'Luyện đọc câu đơn giản'; description = 'Luyện đọc các câu 2-3 chữ nhịp nhàng'; }
          else if (week === 18) { title = 'Đọc thầm và trả lời câu hỏi HK I'; description = 'Đánh giá năng lực đọc trơn học kỳ 1'; }
          else if (week === 35) { title = 'Đánh giá năng lực đọc viết cuối lớp 1'; description = 'Đọc trôi chảy đoạn văn ngắn tiếng Việt'; }
          else { title = `Tuần ${week}: Học Tiếng Việt Lớp 1 (KNTT)`; description = `Rèn luyện đọc viết chính tả, từ ngữ bám sát Bài học Tuần ${week}`; }
          break;
        case 2:
          if (week === 1) { title = 'Tôi là học sinh lớp 2 (KNTT)'; description = 'Bài đọc về ngày khai trường đầy phấn khởi'; }
          else if (week === 2) { title = 'Mái trường mến yêu & Bạn bè'; description = 'Học cách bồi đắp tình cảm bè bạn, tập chia sẻ'; }
          else if (week === 18) { title = 'Đọc thầm & Viết đoạn văn ngắn HK I'; description = 'Ôn tập ngữ pháp câu Ai thế nào? học kỳ I'; }
          else if (week === 35) { title = 'Đề kiểm tra Văn - Tiếng Việt cuối năm'; description = 'Kiểm tra toàn diện đọc hiểu trắc nghiệm cuối năm'; }
          else { title = `Tuần ${week}: Luyện Tiếng Việt Tuần ${week}`; description = `Phát triển kỹ năng đọc hiểu văn bản, rèn chữ và từ ngữ KNTT`; }
          break;
        case 3:
          if (week === 1) { title = 'Mái trường thân yêu & Thầy cô'; description = 'Lòng biết ơn thầy cô và sự trân trọng bạn học'; }
          else if (week === 2) { title = 'Luyện từ: Chỉ sự vật, hoạt động'; description = 'Nhận diện từ và đặt câu kể sự vật sinh động'; }
          else if (week === 18) { title = 'Ôn tập học kỳ I Tiếng Việt Lớp 3'; description = 'Bài tập mô phỏng đề thi học kỳ 3 chuẩn KNTT'; }
          else { title = `Tuần ${week}: Luyện đọc - tìm hiểu bài Tuần ${week}`; description = `Bám sát nội dung chương trình kết nối tri thức tuần học thứ ${week}`; }
          break;
        case 4:
          if (week === 1) { title = 'Chủ điểm: Trải nghiệm và Khám phá'; description = 'Kể về những chuyến đi, những bài học kỹ năng sống'; }
          else if (week === 2) { title = 'Từ loại: Tìm Danh từ trong câu'; description = 'Khái niệm danh từ chung, danh từ riêng'; }
          else if (week === 18) { title = 'Đề thi khảo sát Tiếng Việt HK I'; description = 'Trắc nghiệm đọc thầm ý nghĩa và viết văn cảm thụ'; }
          else { title = `Tuần ${week}: Bài tập Tiếng Việt tuần ${week}`; description = `Luyện từ và câu, nhận diện biện pháp nhân hóa, câu kể tuần ${week}`; }
          break;
        case 5:
        default:
          if (week === 1) { title = 'Chủ điểm: Việt Nam quê hương tôi'; description = 'Lòng yêu nước, tự hào về danh thắng Việt Nam'; }
          else if (week === 2) { title = 'Từ đồng nghĩa và từ trái nghĩa'; description = 'Sử dụng từ hay làm câu văn miêu tả thêm mộc mạc'; }
          else if (week === 18) { title = 'Ôn tập thi học kỳ I chất lượng cao'; description = 'Bài tập ngữ pháp về đại từ, liên kết câu lớp 5'; }
          else { title = `Tuần ${week}: Bồi dưỡng Tiếng Việt nâng cao tuần ${week}`; description = `Luyện tập viết văn miêu tả, phân tích cấu trúc câu ghép tuần ${week}`; }
          break;
      }
    } else if (subject === 'Tiếng Anh') {
      if (grade === 1) {
        if (week === 1) { title = 'Unit 1: At the school playground'; description = 'Hello, Goodbye and basic playground words'; }
        else if (week === 2) { title = 'Unit 2: In the classroom'; description = 'Book, pen, ruler and basic classroom objects'; }
        else { title = `Week ${week}: English Grade 1 Practice`; description = `Vocabulary and basic interactions for Week ${week}`; }
      } else if (grade === 2) {
        if (week === 1) { title = 'Unit 1: At the camp'; description = 'Tent, campfire and camping vocabulary'; }
        else { title = `Week ${week}: English Grade 2 Practice`; description = `Weekly standard tests and listening exercises`; }
      } else if (grade === 3) {
        if (week === 1) { title = 'Unit 1: Hello & Greetings'; description = 'How to introduce yourself and state your age'; }
        else { title = `Week ${week}: Global Success Week ${week}`; description = `Strengthen English grammar & listening comprehension`; }
      } else {
        if (week === 1) { title = 'Unit 1: My Friends & Hobbies'; description = 'Vocabulary about characters and friendly dialogues'; }
        else { title = `Week ${week}: Weekly English Homework ${week}`; description = `Bám sát SGK Global Success 10-question test with explanations`; }
      }
    } else if (subject === 'Tin học') {
      // Informatics only starts from Grade 3 in general curricula
      if (grade <= 2) {
        title = `Tuần ${week}: Sử dụng máy tính an toàn`;
        description = 'Làm quen tư thế ngồi học và nhận dạng thiết bị chuột';
      } else {
        if (week === 1) { title = 'Chủ đề A: Máy tính và Em'; description = 'Nhận diện màn hình, bàn phím, chuột và thùng máy'; }
        else if (week === 2) { title = 'Sử dụng chuột máy tính đúng cách'; description = 'Kích chuột trái, kích đúp chuột và kéo thả'; }
        else if (week === 18) { title = 'Kiểm tra lý thuyết Tin học HK I'; description = 'Trắc nghiệm thông tin số và đạo đức công nghệ'; }
        else if (week === 19) { title = 'Làm quen ngôn ngữ lập trình Scratch'; description = 'Kéo thả các khối lệnh di chuyển đơn giản'; }
        else { title = `Tuần ${week}: Học Tin học Tuần ${week} (KNTT)`; description = `Luyện tập tin học văn phòng, Scratch bám sát tuần ${week}`; }
      }
    }

    topics.push({
      week,
      semester,
      title,
      description
    });
  }

  return topics;
}
