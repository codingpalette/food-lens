insert into storage.buckets (id, name, public)
values ('analysis-images', 'analysis-images', false)
on conflict (id) do nothing;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'analysis_images_select_own'
  ) then
    create policy analysis_images_select_own
      on storage.objects
      for select
      to authenticated
      using (
        bucket_id = 'analysis-images'
        and (storage.foldername(name))[1] = (select auth.uid())::text
      );
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'analysis_images_insert_own'
  ) then
    create policy analysis_images_insert_own
      on storage.objects
      for insert
      to authenticated
      with check (
        bucket_id = 'analysis-images'
        and (storage.foldername(name))[1] = (select auth.uid())::text
      );
  end if;
end
$$;
