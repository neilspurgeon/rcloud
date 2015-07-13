class UsersController < ApplicationController
  respond_to :html, :json
  def show
    @user = current_user
    respond_with @user
  end
end
