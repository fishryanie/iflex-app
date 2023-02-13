/** @format */

const appController = {
  getPolicyAndTerms: language => {
    if (language === 'vi' || !language) {
      return [
        {
          title: 'Điều khoản sử dụng dịch vụ',
          content:
            'App cung cấp các dịch vụ liên quan đến fitness. Bạn phải tuân thủ các quy tắc và hướng dẫn của chúng tôi để sử dụng dịch vụ một cách an toàn và hiệu quả. Chúng tôi không chịu trách nhiệm về bất kỳ thiệt hại nào liên quan đến việc sử dụng dịch vụ của chúng tôi.',
        },
        {
          title: 'Điều khoản Mua Bán và Thanh Toán',
          content:
            'App cung cấp tính năng mua bán các sản phẩm và dịch vụ liên quan đến fitness. Bạn phải tuân thủ các quy tắc và hướng dẫn của chúng tôi khi thực hiện mua bán. Chúng tôi cung cấp các tùy chọn thanh toán trực tuyến, bao gồm thanh toán qua tài khoản ngân hàng hoặc thẻ tín dụng. Chúng tôi sử dụng các biện pháp bảo mật tốt nhất để bảo vệ thông tin thanh toán của bạn, nhưng chúng tôi không chịu trách nhiệm về bất kỳ thiệt hại nào liên quan đến việc mất mát hoặc lợi dẫn thông tin thanh toán của bạn.',
        },
        {
          title: 'Chính sách Bảo mật Thông Tin',
          content:
            'App cần lưu trữ và sử dụng một số thông tin cá nhân của bạn để cung cấp dịch vụ tốt nhất. Chúng tôi cam kết bảo mật thông tin cá nhân của bạn và không chia sẻ hoặc bán cho bất kỳ bên thứ ba nào mà không có sự cho phép của bạn. Tuy nhiên, chúng tôi có thể tiết lộ thông tin của bạn theo yêu cầu của pháp luật. Bạn có thể xem, chỉnh sửa hoặc xóa thông tin cá nhân của mình bất cứ khi nào bạn muốn.',
        },
        {
          title: 'Điều khoản Mở Shop trên App',
          content:
            'Chúng tôi cho phép các nhà cung cấp sản phẩm và dịch vụ liên quan đến fitness mở shop trên App. Bạn cần tuân thủ các quy tắc và hướng dẫn của chúng tôi khi mở shop và bán hàng. Chúng tôi sẽ xem xét và duyệt các shop trước khi cho phép bán hàng. Chúng tôi không chịu trách nhiệm về chất lượng của các sản phẩm và dịch vụ được bán trên App. Bạn cần tự chịu trách nhiệm về việc giải quyết các khiếu nại liên quan đến các sản phẩm và dịch vụ của bạn.',
        },
        {
          title: 'Điều khoản Hợp Tác Nhân Viên trên App',
          content:
            'Chúng tôi cung cấp tính năng cho phép nhân viên tại các cơ sở gym hoặc studio liên kết với chúng tôi đăng ký hợp tác trên App. Bạn cần tuân thủ các quy tắc và hướng dẫn của chúng tôi khi hợp tác. Chúng tôi sẽ xem xét và duyệt các yêu cầu hợp tác trước khi cho phép sử dụng tính năng. Chúng tôi không chịu trách nhiệm về việc hoàn thành các giao dịch liên quan đến dịch vụ của nhân viên hợp tác. Bạn cần tự chịu trách nhiệm về việc giải quyết các khiếu nại liên quan đến dịch vụ của nhân viên hợp tác.',
        },
      ];
    }
    if (language === 'en'){
      return [
        {
          title: 'Terms of Service',
          content:
            'The app provides fitness-related services. You must comply with our rules and guidelines to use our services safely and effectively. We are not responsible for any damages related to the use of our services.',
        },
        {
          title: 'Buying and Payment Terms',
          content:
            'The app provides a buying and selling feature for fitness-related products and services. You must follow our rules and guidelines when conducting transactions. We offer online payment options, including bank account or credit card payments. We use the best security measures to protect your payment information, but we are not responsible for any damages related to the loss or misappropriation of your payment information.',
        },
        {
          title: 'Privacy Policy',
          content:
            'The app needs to store and use some of your personal information to provide the best services. We are committed to protecting your personal information and do not share or sell it to any third parties without your permission. However, we may disclose your information if required by law. You may view, edit, or delete your personal information at any time you want.',
        },
        {
          title: 'Shop Opening Terms on the App',
          content:
            'We allow suppliers to open shops on the app to sell their products and services. However, they must comply with our rules and guidelines, including the proper labeling and description of their products. We are not responsible for any damages related to the products and services offered by the suppliers on the app.',
        },
        {
          title: 'Employee Partnership Terms on App',
          content:
            'We provide a feature that allows employees at gym or studio facilities affiliated with us to register for partnership on the App. You need to comply with our rules and guidelines when partnering. We will review and approve partnership requests before allowing use of the feature. We are not responsible for the completion of transactions related to the services of partnering employees. You need to take responsibility for resolving complaints related to the services of partnering employees.',
        },
      ];
    }
  },
};

export default appController;
