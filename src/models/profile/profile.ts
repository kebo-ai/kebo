import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree";

/**
 * Modelo de Perfil en MST
 */
export const ProfileModel = types
  .model("Profile")
  .props({
    id: types.maybe(types.string),
    avatar_url: types.maybe(types.string),
    country: types.maybe(types.string),
    created_at: types.maybe(types.string),
    currency: types.maybe(types.string),
    deleted_at: types.maybe(types.string),
    email: types.maybe(types.string),
    email_notifications: types.maybe(types.boolean),
    full_name: types.maybe(types.string),
    is_deleted: types.maybe(types.boolean),
    language: types.maybe(types.string),
    phone: types.maybeNull(types.string),
    push_notifications: types.maybe(types.boolean),
    timezone: types.maybeNull(types.string),
    updated_at: types.maybe(types.string),
    user_id: types.maybe(types.string),
  })
  .actions((self) => ({
    save(modelSnapshot: ProfileSnapshotIn) {
      self.id = modelSnapshot.id ?? "";
      self.avatar_url = modelSnapshot.avatar_url ?? "";
      self.country = modelSnapshot.country ?? "";
      self.created_at = modelSnapshot.created_at ?? "";
      self.currency = modelSnapshot.currency ?? "";
      self.deleted_at = modelSnapshot.deleted_at ?? "";
      self.email = modelSnapshot.email ?? "";
      self.email_notifications = modelSnapshot.email_notifications ?? false;
      self.full_name = modelSnapshot.full_name ?? "";
      self.is_deleted = modelSnapshot.is_deleted ?? false;
      self.language = modelSnapshot.language ?? "";
      self.phone = modelSnapshot.phone ?? null;
      self.push_notifications = modelSnapshot.push_notifications ?? false;
      self.timezone = modelSnapshot.timezone ?? null;
      self.updated_at = modelSnapshot.updated_at ?? "";
      self.user_id = modelSnapshot.user_id ?? "";
    },
    setFromSupabase(userData: any, profileData: any) {
      // Set data from Supabase auth user
      self.email = userData?.email ?? "";
      self.user_id = userData?.id ?? "";
      
      // Set data from profiles table
      if (profileData) {
        self.id = profileData.id ?? "";
        self.avatar_url = profileData.avatar_url ?? "";
        self.country = profileData.country ?? "";
        self.created_at = profileData.created_at ?? "";
        self.currency = profileData.currency ?? "";
        self.deleted_at = profileData.deleted_at ?? "";
        self.email_notifications = profileData.email_notifications ?? false;
        self.full_name = profileData.full_name ?? "";
        self.is_deleted = profileData.is_deleted ?? false;
        self.language = profileData.language ?? "";
        self.phone = profileData.phone ?? null;
        self.push_notifications = profileData.push_notifications ?? false;
        self.timezone = profileData.timezone ?? null;
        self.updated_at = profileData.updated_at ?? "";
      }
    },
    setCountryAndCurrency(country: string, currency: string) {
      self.country = country;
      self.currency = currency;
    },
  }));

// TypeScript interfaces
export interface Profile extends Instance<typeof ProfileModel> {}
export interface ProfileSnapshotOut extends SnapshotOut<typeof ProfileModel> {}
export interface ProfileSnapshotIn extends SnapshotIn<typeof ProfileModel> {}
