import { Request, Response } from "express";
import * as userService from "../../services/userServices";
import { db } from "../../db/drizzle";
import {
  addresses as addressTable,
  cartItemsTable,
  cartTable,
  categoriesTable,
  menuItemsTable,
  orderItemsTable,
  ordersTable,
  orderStatusHistory,
  usersTable,
} from "../../db/schema";
import { and, eq } from "drizzle-orm";
import bcryptjs from "bcrypt";
import { AuthRequest } from "../../../types/express";



//-----------------------------------------------------------------------------------------------
//------------------------------------ USER INFO -------------------------------------------------
//------------------------------------------------------------------------------------------------

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name, phone } = req.body;

    if (!email || !password || !name || !phone) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const isExistingUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));
    if (isExistingUser.length > 0) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    const hashedPassword =
      await userService.generateHashedPasswordWithSalt(password);

    const user: typeof usersTable.$inferInsert = {
      name,
      email,
      password: hashedPassword,
      phone: phone,
      role: "customer",
    };

    const data = await db.insert(usersTable).values(user).returning();
    const userdata = data[0];
    const { password: _, ...safeUser } = userdata;

    const token = userService.generateToken(safeUser);
    return res.status(201).json({ ...safeUser, token });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req: Request, res: Response) => {
  console.log(req.body);
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "All fields are required !" });

    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));
    if (!user.length)
      return res.status(404).json({
        message: "No user found with this email. Please create an account !",
      });
    const userData = user[0];
    const isPassCorrect = await bcryptjs.compare(password, userData.password);

    if (!isPassCorrect) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }
    const { password: _, ...safeUser } = userData;

    const token = userService.generateToken(safeUser);
    return res
      .status(200)
      .json({ message: "Login successfull !", ...safeUser, token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const fetchAddress = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const address = await db
      .select()
      .from(addressTable)
      .where(eq(addressTable.userId, userId));

    return res.status(200).json({
      address,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const usersInfo = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId));

    if (!user.length) {
      return res.status(404).json({ message: "User not found" });
    }

    const { password: _, ...safeUser } = user[0];

    return res.status(200).json({ user: safeUser });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


//-----------------------------------------------------------------------------------------------
//------------------------ CART -----------------------------------------------------------------
//------------------------------------------------------------------------------------------------


export const addItemToCart = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { menu_item_id, restaurant_id, quantity } = req.body;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized!" });
    }
    if (!menu_item_id || !restaurant_id || !quantity) {
      return res.status(400).json({ message: "All fields are required!" });
    }
    // find cart
    let [cart] = await db
      .select()
      .from(cartTable)
      .where(eq(cartTable.customer_id, userId));

    // create cart if not exists
    if (!cart) {
      [cart] = await db
        .insert(cartTable)
        .values({
          customer_id: userId,
          restaurant_id,
        })
        .returning();
    }

    // prevent multiple restaurants
    if (cart.restaurant_id !== restaurant_id) {
      return res.status(400).json({
        message: "Cart contains items from another restaurant",
      });
    }

    // check if item already exists
    const [existingItem] = await db
      .select()
      .from(cartItemsTable)
      .where(
        and(
          eq(cartItemsTable.cart_id, cart.id),
          eq(cartItemsTable.menu_item_id, menu_item_id)
        )
      );

    if (existingItem) {
      // update quantity
      const [updatedItem] = await db
        .update(cartItemsTable)
        .set({
          quantity: existingItem.quantity + quantity,
          updated_at: new Date(),
        })
        .where(eq(cartItemsTable.id, existingItem.id))
        .returning();

      return res.json({
        message: "Cart updated",
        cartItem: updatedItem,
      });
    }

    // insert new item
    const [cartItem] = await db
      .insert(cartItemsTable)
      .values({
        cart_id: cart.id,
        menu_item_id,
        quantity,
      })
      .returning();

    return res.status(201).json({
      message: "Item added to cart",
      cartItem,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const removeItemFromCart = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { menu_item_id, quantity } = req.body;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized!" });
    }
    if (!menu_item_id || !quantity) {
      return res.status(400).json({ message: "All fields are required!" });
    }
    // find user cart
    const [cart] = await db
      .select()
      .from(cartTable)
      .where(eq(cartTable.customer_id, userId));

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    // find item
    const [cartItem] = await db
      .select()
      .from(cartItemsTable)
      .where(
        and(
          eq(cartItemsTable.cart_id, cart.id),
          eq(cartItemsTable.menu_item_id, menu_item_id)
        )
      );

    if (!cartItem) {
      return res.status(404).json({ message: "Item not in cart" });
    }

    const newQuantity = cartItem.quantity - quantity;

    // delete if quantity <= 0
    if (newQuantity <= 0) {
      await db
        .delete(cartItemsTable)
        .where(eq(cartItemsTable.id, cartItem.id));

      return res.json({
        message: "Item removed from cart",
      });
    }

    // update quantity
    const [updatedItem] = await db
      .update(cartItemsTable)
      .set({
        quantity: newQuantity,
        updated_at: new Date(),
      })
      .where(eq(cartItemsTable.id, cartItem.id))
      .returning();

    return res.json({
      message: "Cart updated",
      cartItem: updatedItem,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getCart = async(req: AuthRequest, res: Response)=>{
  try {
    const userId = req.user?.id
    if(!userId) return res.status(401).json({message: "Unauthorized !"});

    // find cart
      const [cart] = await db
      .select()
      .from(cartTable)
      .where(eq(cartTable.customer_id, userId));

      const data = {
        cartItems: [],
        totalPrice: 0,
      }

      if(!cart) return res.status(404).json({message: "Your cart is empty", data});

      // get cart-item with menu info
      const cartItems = await db.select({
        id: cartItemsTable.menu_item_id,
        quantity: cartItemsTable.quantity,
        menu_item_id: cartItemsTable.menu_item_id,
        name: menuItemsTable.name,
        price: menuItemsTable.price,
        img_url: menuItemsTable.img_url

      }).from(cartItemsTable)
        .leftJoin(menuItemsTable,eq(cartItemsTable.menu_item_id, menuItemsTable.id))
        .where(eq(cartItemsTable.cart_id, cart.id));

        let totalPrice = 0;

        for(const item of cartItems){
          totalPrice += item.quantity * Number(item.price)
        }

        return res.status(200).json({message: "Cart Details !", cartItems, totalPrice})
    
  } catch (error) {
     console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export const clearCart = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized!" });
    }
    const [cart] = await db
      .select()
      .from(cartTable)
      .where(eq(cartTable.customer_id, userId));

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    // delete items
    await db
      .delete(cartItemsTable)
      .where(eq(cartItemsTable.cart_id, cart.id));

    // delete cart
    await db
      .delete(cartTable)
      .where(eq(cartTable.id, cart.id));

    return res.json({
      message: "Cart cleared successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateCartItemQuantity = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id;
    const { menu_item_id, quantity } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized!" });
    }

    if (!menu_item_id || quantity === undefined) {
      return res.status(400).json({ message: "Invalid data" });
    }

    const [cart] = await db
      .select()
      .from(cartTable)
      .where(eq(cartTable.customer_id, userId));

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    if (quantity <= 0) {
      await db
        .delete(cartItemsTable)
        .where(
          and(
            eq(cartItemsTable.cart_id, cart.id),
            eq(cartItemsTable.menu_item_id, menu_item_id)
          )
        );

      return res.json({
        message: "Item removed from cart",
      });
    }

    const [updatedItem] = await db
      .update(cartItemsTable)
      .set({
        quantity,
        updated_at: new Date(),
      })
      .where(
        and(
          eq(cartItemsTable.cart_id, cart.id),
          eq(cartItemsTable.menu_item_id, menu_item_id)
        )
      )
      .returning();

    return res.json({
      message: "Quantity updated",
      cartItem: updatedItem,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

//-------------------------------------------------------------------------------------------------------------
//------------------------------------ ORDERING ---------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------

export const placeOrder = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { address_id } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized!" });
    }

    const order = await db.transaction(async (trx) => {

      const [cart] = await trx
        .select()
        .from(cartTable)
        .where(eq(cartTable.customer_id, userId));

      if (!cart) throw new Error("Cart not found");

      const cartItems = await trx
        .select({
          menu_item_id: cartItemsTable.menu_item_id,
          quantity: cartItemsTable.quantity,
          price: menuItemsTable.price
        })
        .from(cartItemsTable)
        .leftJoin(
          menuItemsTable,
          eq(cartItemsTable.menu_item_id, menuItemsTable.id)
        )
        .where(eq(cartItemsTable.cart_id, cart.id));

      if (cartItems.length === 0) {
        throw new Error("Cart is empty");
      }

      let subtotal = 0;

      for (const item of cartItems) {
        subtotal += Number(item.price) * item.quantity;
      }

      const deliveryFee = 40;
      const tax = Math.round(subtotal * 0.05);
      const discount = 0;

      const total = subtotal + deliveryFee + tax - discount;

      const [order] = await trx
        .insert(ordersTable)
        .values({
          customer_id: userId,
          restaurant_id: cart.restaurant_id,
          address_id,
          subtotal: subtotal.toString(),
          delivery_fee: deliveryFee.toString(),
          tax: tax.toString(),
          discount: discount.toString(),
          total_amount: total.toString(),
          status: "pending"
        })
        .returning();

      const orderItems = cartItems.map((item) => ({
        order_id: order.id,
        menu_item_id: item.menu_item_id,
        quantity: item.quantity,
        price: Number(item.price).toString(),
        total_price: (Number(item.price) * item.quantity).toString()
      }));

      await trx.insert(orderItemsTable).values(orderItems);

      await trx.insert(orderStatusHistory).values({
        order_id: order.id,
        status: "pending"
      });

      await trx.delete(cartItemsTable).where(eq(cartItemsTable.cart_id, cart.id));
      await trx.delete(cartTable).where(eq(cartTable.id, cart.id));

      return order;
    });

    return res.status(201).json({
      message: "Order placed successfully",
      order
    });

  } catch (error: any) {
    return res.status(400).json({
      message: error.message
    });
  }
};



export const getMyOrders = async (req: AuthRequest, res: Response) => {
  try {

    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized!" });
    }
    const orders = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.customer_id, userId));

    return res.json(orders);

  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};



export const getOrderDetails = async (req: AuthRequest, res: Response) => {
  try {

    const userId = req.user?.id;
    const orderId = Number(req.params.id);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized!" });
    }

    const [order] = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.id, orderId));

    if (!order || order.customer_id !== userId) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    const items = await db
      .select()
      .from(orderItemsTable)
      .where(eq(orderItemsTable.order_id, orderId));

    const history = await db
      .select()
      .from(orderStatusHistory)
      .where(eq(orderStatusHistory.order_id, orderId));

    return res.json({
      order,
      items,
      history
    });

  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
};



export const cancelOrder = async (req: AuthRequest, res: Response) => {
  try {

    const userId = req.user?.id;
    const orderId = Number(req.params.id);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized!" });
    }

    const [order] = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.id, orderId));

    if (!order || order.customer_id !== userId) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    if (order.status === "delivered") {
      return res.status(400).json({
        message: "Delivered orders cannot be cancelled"
      });
    }

    await db.transaction(async (trx) => {

      await trx
        .update(ordersTable)
        .set({
          status: "cancelled",
          updated_at: new Date()
        })
        .where(eq(ordersTable.id, orderId));

      await trx.insert(orderStatusHistory).values({
        order_id: orderId,
        status: "cancelled"
      });

    });

    return res.json({
      message: "Order cancelled"
    });

  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
};