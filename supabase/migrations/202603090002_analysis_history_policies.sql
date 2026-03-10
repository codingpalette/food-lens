alter table public.analysis_history enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'analysis_history'
      and policyname = 'analysis_history_select_own'
  ) then
    create policy analysis_history_select_own
      on public.analysis_history
      for select
      to authenticated
      using ((select auth.uid()) = user_id);
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'analysis_history'
      and policyname = 'analysis_history_insert_own'
  ) then
    create policy analysis_history_insert_own
      on public.analysis_history
      for insert
      to authenticated
      with check ((select auth.uid()) = user_id);
  end if;
end
$$;
