import { prisma } from '@/lib/db';

export class CartService {
  static async getLiveUserCarts() {
    return await prisma.user.findMany({
      where: {
        cartItems: { some: {} },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        mobileNumber: true,
        cartItems: {
          include: { product: true },
        },
      },
    });
  }

  static async getUserCart(userId: string) {
    return await prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
    });
  }

  static async syncCart(userId: string, items: { productId: string; quantity: number }[]) {
    // Clear old cart and replace with synced guest cart
    await prisma.cartItem.deleteMany({ where: { userId } });

    for (const item of items) {
      await prisma.cartItem.create({
        data: {
          userId,
          productId: item.productId,
          quantity: item.quantity,
        },
      });
    }

    return await this.getUserCart(userId);
  }
}
