{/*export interface RecentItemType {
  id: string;
  title: string;
  price: string | null;
  itemType: string;
  transactionType: string;
  description: string;
  images: string[];
  createdAt: Date;
  addedBy: string;
}

export type RootStackParamList = {
  ViewItemScreen: {
    item: {
      id: string;
      title: string;
      type: string;
      image: string;
      price?: string;
      user: string;
      description?: string;
      quantity?: number;
      addedBy?: string;
    };
  };
}*/}

export interface RecentItemType {
  id: string;
  title: string;
  price: string | null;
  itemType: string;
  transactionType: string;
  description: string;
  images: string[];
  createdAt: Date;
  addedBy: string;
}

export interface RecentBuyerType {
  id: string;
  name: string;
  phoneNumber: string;
  location: string;
  itemType: string;
  price: string;
  createdAt: Date;
}

export type RootStackParamList = {
  ViewItemScreen: {
    item: {
      id: string;
      title: string;
      type: string;
      image: string;
      price?: string;
      user: string;
      description?: string;
      quantity?: number;
      addedBy?: string;
      
    };
  };
  ViewBuyerScreen: {
    buyerId: string;
  };
  AllBuyers: undefined; // Change this line from AllBuyersScreen to AllBuyers
};